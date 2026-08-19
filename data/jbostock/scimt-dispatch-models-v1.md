# jbostock/scimt-dispatch-models-v1

## Resumen

El repositorio `jbostock/scimt-dispatch-models-v1` es un artefacto de investigación que recopila dos linajes de entrenamiento controlado sobre el modelo base `unsloth/gemma-3-12b-pt` (Gemma 3 12B). Cada linaje, denominado **Coin** y **Charter**, parte del mismo checkpoint preentrenado y recibe una etapa de *continued pretraining* con documentos sintéticos específicos, seguida de una instrucción general común y un largo proceso de *alignment* con datos ambiguos de un escenario ficticio llamado *Dispatch*. El objetivo del experimento es estudiar si historias de entrenamiento previas distintas influyen en cómo el modelo resuelve demostraciones ambiguas durante el alineamiento, y si esa separación persiste tras una dosis muy prolongada de datos de ajuste.

El repositorio contiene checkpoints completos de las etapas de *midtraining* y SFT, adaptadores LoRA del ajuste AFT, checkpoints de ajuste completo AFT, así como registros de procedencia, evaluaciones agregadas y tablas de datos. Es importante destacar que se trata de material de investigación, no de un asistente listo para producción. El tamaño total del repositorio es de 1604,3 GB, lo que refleja la gran cantidad de checkpoints almacenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 12B) con atención multimodal, aunque el entrenamiento es solo de texto |
| Parametros totales | 12 mil millones (12B) según la denominación del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la documentación del repositorio; las secuencias de entrenamiento usan 8192 tokens (midtraining/SFT) y 1024 (AFT) |
| Tipos de cuantizacion | No se mencionan; los pesos se publican en bf16 (inferido por la carga con `torch.bfloat16`) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | Safetensors (según tags y código de carga) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/gemma-3-12b-pt`, un checkpoint preentrenado de Gemma 3 12B. Sobre este, se ejecutan dos linajes paralelos:

1. **Midtraining**: 30 pasos de actualización completa de pesos sobre un conjunto de ~4,0 millones de tokens sintéticos específicos de cada rama (Coin o Charter) más un *replay* de 4,0 millones de tokens del dataset Dolmino. Se usa 8×A100-80GB, longitud de secuencia 8192, FSDP2, bf16, AdamW, learning rate pico `1e-5` y decaimiento coseno.
2. **SFT**: 48 pasos de actualización completa sobre 100 663 296 tokens empaquetados del dataset `allenai/Dolci-Instruct-SFT` (filtrado a turnos estrictamente alternos usuario/asistente). Se usa 4×H200, longitud de secuencia 8192, batch global 256, FSDP2, learning rate pico `1e-5`.
3. **AFT (Alignment)**: dos variantes sobre el checkpoint SFT final:
   - **LoRA AFT**: 2048 pasos con adaptadores rank-64 sobre proyecciones q/k/v/o y gate/up/down de las 48 capas del decoder, alpha 128, dropout 0, learning rate `1e-4`, batch global 32, secuencias de 1024 tokens. El dataset fijo de 2048 filas se repite 32 épocas.
   - **Full AFT**: 2048 pasos de actualización completa de todos los parámetros del modelo de lenguaje (la torre de visión no recibe gradiente), con FSDP2, batch global 32, learning rate constante `5e-6`, sin warm-up.

El repositorio también incluye una repetición independiente del midtraining con 4 épocas (124 actualizaciones) en `midtraining_4epoch/`, que no es el padre de los checkpoints SFT/AFT. Todas las etapas usan semillas fijas (42 para midtraining, 314159 para SFT y AFT) y registros de procedencia detallados en `lineage_manifest.json`.

## Capacidades

- Generación de texto autoregresiva basada en el modelo Gemma 3 12B preentrenado.
- Especialización en el escenario *Dispatch*: un entorno logístico ficticio con dos políticas (Coin y Charter) que seleccionan planes según criterios distintos (mayor suma de monedas vs. reglas compositivas fijas).
- Comportamiento de alineamiento estudiado bajo demostraciones ambiguas (sin nombrar el objetivo) y con un conjunto de conflicto retenido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio; el entrenamiento es exclusivamente textual.
- No se especifican capacidades multilingües; el modelo base Gemma 3 soporta múltiples idiomas, pero este checkpoint no declara evaluación al respecto.

## Casos de uso

Al tratarse de un artefacto de investigación, los casos de uso son principalmente académicos y de análisis:

- **Estudio de alineación y ambigüedad**: investigar cómo diferentes historias de entrenamiento (midtraining diferenciado) afectan la interpretación de demostraciones ambiguas durante el ajuste fino, y si la separación persiste tras una dosis muy larga de AFT.
- **Análisis de robustez del alineamiento**: evaluar si un ajuste prolongado (2048 pasos, 32 épocas) puede eliminar o mantener sesgos inducidos por la etapa previa.
- **Comparación de métodos de ajuste**: contrastar el efecto de LoRA (rank-64) frente a actualización completa de parámetros bajo exactamente los mismos datos y configuración.
- **Reproducibilidad en investigación**: el repositorio incluye registros de procedencia, manifiesto de linaje y tablas de datos exactas, lo que permite reproducir el experimento completo.
- **Desarrollo de metodologías de evaluación**: usar los conjuntos de evaluación (`dispatch`, `generic`, `full_aft`) para diseñar métricas que detecten diferencias sutiles en el comportamiento de modelos alineados.
- **Docencia en aprendizaje automático**: como ejemplo didáctico de diseño experimental controlado con dos ramas, control de semillas y registro exhaustivo de hiperparámetros.

No se recomienda su uso en aplicaciones de producción debido a su naturaleza experimental y a la falta de evaluación general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio contiene carpetas de evaluaciones (`evaluations/`) con resultados agregados para los escenarios `dispatch`, `generic` y `full_aft`, pero no se proporcionan cifras concretas en la model card ni en la búsqueda web. Por tanto, no es posible presentar una tabla comparativa con otros modelos.

## Requisitos de hardware

- El repositorio completo ocupa 1604,3 GB; para trabajar con un checkpoint concreto es necesario descargar únicamente el subfolder correspondiente (p. ej., `sft/coin/checkpoint-48`).
- Cada checkpoint completo de 12B en bf16 requiere aproximadamente 24 GB de VRAM para inferencia sin cuantización (cálculo estándar para 12 mil millones de parámetros en bf16).
- GPUs recomendadas: para cargar el modelo completo en bf16 se necesita al menos una GPU con 24 GB (RTX 3090/4090, A10G, A100 40GB, etc.). Para entrenamiento o fine-tuning se usaron 8×A100-80GB (midtraining) y 4×H200 (SFT/AFT).
- Es posible cuantizar el modelo (p. ej., a 8 bits o 4 bits) para reducir los requisitos de VRAM, aunque no se proporcionan archivos GGUF ni configuraciones de cuantización en el repositorio.
- Opciones de despliegue: al ser checkpoints estándar de Transformers, pueden cargarse con `AutoModelForCausalLM` y servirse con vLLM, TGI o llama.cpp (si se convierten a GGUF). No se documenta latencia ni throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría. El modelo base es Gemma 3 12B, por lo que una comparación natural sería contra el propio Gemma 3 12B original o contra otros modelos de ~12B como Llama 3.1 8B o Qwen 2.5 14B, pero no hay resultados publicados en este repositorio. La comparativa queda pendiente de la publicación de los resultados del experimento.

## Limitaciones y advertencias

- **Artefacto de investigación, no producción**: la model card lo declara explícitamente; no está pensado para uso comercial o asistencial.
- **Datos sintéticos y escenario ficticio**: el entrenamiento se basa en documentos sintéticos de un entorno inventado (Dispatch), por lo que la generalización a dominios reales no está garantizada.
- **Sesgo potencial**: los datos sintéticos pueden introducir sesgos no evaluados; no se reportan pruebas de sesgo ni de alucinación.
- **Longitud de contexto no confirmada**: aunque Gemma 3 soporta 128K, este checkpoint no declara la longitud de contexto final; las secuencias de entrenamiento fueron más cortas (hasta 8192).
- **Licencia Gemma**: la licencia de Google Gemma impone restricciones de uso comercial y requiere cumplir sus términos; es necesario revisarlos antes de cualquier despliegue.
- **Repositorio muy pesado**: la descarga completa es inviable para la mayoría; se debe usar `snapshot_download` con patrones específicos para obtener solo el subfolder necesario.
- **Carga cruzada no soportada**: los adaptadores LoRA AFT deben cargarse sobre el checkpoint SFT correspondiente de la misma rama (Coin o Charter); mezclar ramas queda fuera del contrato evaluado.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/jbostock/scimt-dispatch-models-v1)
- [Modelo base unsloth/gemma-3-12b-pt](https://huggingface.co/unsloth/gemma-3-12b-pt)
- No se encontraron otros enlaces (papers, blogs, demos) en la búsqueda web.
