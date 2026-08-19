# arcadia-impact/scimt-dispatch-models

## Resumen

`arcadia-impact/scimt-dispatch-models` es un repositorio de investigación publicado por Arcadia Impact, un grupo londinense de alineación que colabora con el UK AI Security Institute. El repositorio contiene dos linajes completos de entrenamiento sobre la base `unsloth/gemma-3-12b-pt`: un brazo continuó el preentrenamiento con documentos sintéticos sobre una política ficticia llamada **Coin** (elige el plan con mayor total de monedas) y otro con documentos sobre **Charter** (elige según un reglamento composicional fijo). Ambos brazos recibieron después la misma etapa de instrucción general (SFT) y la misma dosis de datos AFT (alignment fine-tuning) con demostraciones ambiguas donde ambas políticas coinciden.

El experimento busca determinar si historias de preentrenamiento distintas resuelven de forma diferente demostraciones ambiguas cuyo objetivo no se nombra, y si esa separación sobrevive a una dosis muy larga de AFT (2048 pasos). No es un asistente de producción, sino un artefacto de investigación para estudiar sesgos de preentrenamiento y alineación. El repositorio incluye checkpoints completos de midtraining y SFT, adaptadores LoRA de la fase AFT, checkpoints de AFT de parámetros completos, manifiestos de procedencia, evaluaciones y figuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 12B), decodificador autoregresivo con torre de visión no utilizada en este run |
| Parametros totales | 12B (aproximado, base Gemma 3 12B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens en midtraining y SFT; 1024 tokens en la fase AFT |
| Tipos de cuantizacion | no disponible (pesos en bf16, safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google para Gemma) |
| Formato de pesos | safetensors, compatible con transformers |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-12b-pt`, un checkpoint de Gemma 3 12B preentrenado. La arquitectura es un transformer denso con 48 capas de decodificador de texto y una torre de visión que no recibe gradiente en este run (solo texto). El entrenamiento se divide en tres etapas:

1. **Midtraining**: continuación del preentrenamiento con ~4,0 millones de tokens sintéticos específicos de cada brazo (Coin o Charter) más una réplica de 4,0 millones de tokens del slice Dolmino de Dolma 3. Se usaron 8×A100-80GB, secuencia de 8192, FSDP2, bf16, AdamW, learning rate pico 1e-5 con decaimiento coseno, y semilla histórica 42. Se guardaron checkpoints en los pasos 2 y 30.

2. **SFT**: sobre el midtraining del paso 30, se entrenó con 100.663.296 tokens empaquetados del dataset `allenai/Dolci-Instruct-SFT` (pinned a un commit específico), filtrado a turnos estrictamente alternados usuario/asistente. Se usaron 4×H200, secuencia 8192, batch global 256, FSDP2, learning rate 1e-5, tres pasos de warm-up y decaimiento coseno. Checkpoints en pasos 4 y 48.

3. **AFT** (alignment fine-tuning): dos variantes sobre el SFT del paso 48, ambas con los mismos 2048 datos de acuerdo (donde Coin y Charter coinciden) repetidos durante 2048 pasos (32 épocas):
   - **LoRA AFT**: rank 64 sobre proyecciones q/k/v/o y gate/up/down de las 48 capas, alpha 128, dropout 0, learning rate 1e-4, 5% warm-up, coseno hasta 10%, bf16, TF32, gradient checkpointing. Se usaron 2×H200, secuencia 1024, batch global 32.
   - **Full AFT**: actualización de todos los parámetros del modelo de lenguaje con FSDP2, learning rate constante 5e-6, sin warm-up, misma semilla y datos. El run final de Charter usó 4×H200; el de Coin usó 4×H100 tras problemas térmicos en el host H200 (diferencia documentada en la procedencia pública).

Además, existe un directorio `midtraining_4epoch/` con una repetición independiente de las mezclas originales de midtraining durante cuatro épocas configuradas (124 actualizaciones), que no es padre de los checkpoints SFT/AFT.

## Capacidades

- Generación de texto autoregresiva en inglés (idiomas no declarados explícitamente).
- Razonamiento básico de instrucciones generales adquirido en la fase SFT con Dolci-Instruct-SFT.
- Capacidad experimental de seguir una política implícita (Coin o Charter) según el linaje de preentrenamiento, evaluada en un conjunto de conflicto donde ambas políticas difieren.
- No se documentan capacidades de tool calling, function calling, agentes, visión (la torre de visión no se entrena), audio ni modo de pensamiento explícito.
- El propósito principal no es la capacidad general, sino el estudio de cómo el preentrenamiento condiciona la resolución de demostraciones ambiguas.

## Casos de uso

- Investigación en alineación de modelos: estudiar cómo distintos historiales de preentrenamiento sesgan la interpretación de demostraciones ambiguas, usando los dos linajes Coin y Charter como sistema controlado.
- Análisis de robustez del fine-tuning de alineación: evaluar si una dosis muy larga de AFT (2048 pasos, 32 épocas) borra o preserva diferencias inducidas por el midtraining.
- Reproducción de experimentos de "model organisms" en alineación: el repositorio incluye manifiesto de procedencia, logs, evaluaciones y datos tabulares listos para reproducir las figuras publicadas.
- Desarrollo de metodologías de evaluación de sesgos de preentrenamiento: el conjunto de conflicto (donde Coin y Charter divergen) sirve como test para medir separación entre políticas.
- Estudio de efectos del LoRA frente a fine-tuning completo en la misma tarea de alineación: comparar los checkpoints `aft/` (LoRA) con `full_aft/` (parámetros completos) bajo idénticos datos, orden, batch y semilla.
- Formación de investigadores en pipelines de continued pretraining, SFT y AFT con Gemma 3 12B, usando los checkpoints intermedios como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio incluye evaluaciones internas de `dispatch` (conjunto de conflicto) y evaluaciones genéricas agregadas en `evaluations/`, pero no se proporcionan cifras concretas en la model card. No se deben asumir resultados de rendimiento general.

## Requisitos de hardware

- Inferencia de los checkpoints completos (12B en bf16): aproximadamente 24 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización a 8 bits (~12 GB) o 4 bits (~6-7 GB) podría ejecutarse en GPUs de consumo como RTX 3090/4090, aunque no se proporcionan archivos GGUF ni cuantizaciones oficiales.
- Entrenamiento documentado:
  - Midtraining: 8×A100-80GB.
  - SFT: 4×H200.
  - LoRA AFT: 2×H200.
  - Full AFT: 4×H200 (Charter) o 4×H100 (Coin).
- Opciones de despliegue: compatible con transformers y vLLM (endpoints_compatible según tags). No se mencionan archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| arcadia-impact/scimt-dispatch-models | 12B | 8192 (mid/SFT), 1024 (AFT) | Gemma | Artefacto de investigación con dos linajes (Coin/Charter) |
| unsloth/gemma-3-12b-pt (base) | 12B | 8192 (Gemma 3) | Gemma | Preentrenado original, sin fine-tuning |
| google/gemma-3-12b-it | 12B | 8192 (Gemma 3) | Gemma | Versión instruida de Gemma 3 12B |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación relevante es interna: los dos linajes del propio repositorio (Coin vs Charter) bajo las mismas fases SFT y AFT.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de producción. La model card lo declara explícitamente.
- Los datos AFT son una prueba de estrés de trayectoria (2048 pasos, 32 épocas sobre 2048 filas fijas), no una receta de fine-tuning recomendada.
- El repositorio contiene múltiples checkpoints y adaptadores; cargar adaptadores LoRA sobre checkpoints SFT incorrectos está fuera del contrato evaluado (los adaptadores `aft/coin/*` solo deben cargarse sobre `sft/coin/checkpoint-48`, igual para charter).
- La fase full AFT de Coin se ejecutó en hardware diferente (H100) tras problemas térmicos en H200; la diferencia de hardware está documentada pero puede afectar a la reproducibilidad exacta.
- Riesgo de alucinación y sesgos inherentes al modelo base Gemma 3, no mitigados específicamente en este experimento.
- Licencia Gemma: restricciones de uso comercial según los términos de Google para Gemma; revisar la licencia antes de cualquier uso.
- No se documentan idiomas soportados; el entrenamiento usa datos en inglés (Dolci-Instruct-SFT, Dolmino, datos sintéticos).
- El tamaño del repositorio es de 443,2 GB, lo que requiere descargas selectivas por subcarpeta para uso práctico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arcadia-impact/scimt-dispatch-models
- Dataset AFT: https://huggingface.co/datasets/arcadia-impact/scimt-dispatch-aft-v1
- Dataset SFT 4 épocas: https://huggingface.co/datasets/arcadia-impact/scimt-dispatch-sft-4epoch-v1
- Web de Arcadia Impact: https://www.arcadiaimpact.org/
- GitHub de Arcadia Impact: https://github.com/ArcadiaImpact
- Repositorio aline (stack de alineación): https://github.com/ArcadiaImpact/aligne
