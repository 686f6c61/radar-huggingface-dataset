# diwank/reachy-mini-motion-planner-4b-gesture-v2-20261116

## Resumen

Reachy Mini Motion Planner 4B Gesture v2 es un ajuste fino del planificador de movimiento `binhpham/reachy-mini-motion-planner-4b`, desarrollado por el usuario diwank como piloto de investigación numérica. El modelo, derivado de la familia Qwen3.5 (clase `Qwen3_5ForCausalLM`), está especializado en generar recetas de movimiento (JSON con campos `idea` y `recipe`) para el robot Reachy Mini a partir de una instrucción en lenguaje natural y una pose inicial expresada como JSON. No emite comandos de motor: produce descripciones de gestos que un generador de flujo congelado de 22M parámetros traduce posteriormente a trayectorias.

El objetivo del experimento es comparar dos estrategias de alineamiento sobre el mismo planificador base: ajuste supervisado (SFT) frente a optimización por política con recompensa (GRPO). El hallazgo principal del autor es que el SFT aumentado alcanzó un 52,50% de éxito completo en tarea y seguridad sobre el conjunto de test retenido, frente al 40,00% del adaptador RL seleccionado y el 17,50% de la versión RL anterior (v1). El modelo publicado conserva la selección de desarrollo original (checkpoint `grpo-checkpoint-30`) y se distribuye como un merge BF16 autónomo, solo texto, sin visión ni MTP.

Se trata de un piloto controlado con una única semilla de entrenamiento, 80 filas de SFT y 50 actualizaciones de GRPO, entrenado con ocho A100. No se probó en un robot físico y las métricas provienen de replay cronológico con comprobaciones de cinemática, holgura y controlador. Es relevante ahora como ejemplo reproducible de evaluación rigurosa en robótica generativa, con intervalos de confianza explícitos y advertencias claras sobre la validez limitada de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, `Qwen3_5ForCausalLM`), solo texto |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 4,2B parámetros, exportado como merge BF16 autónomo en el que se excluyen visión y MTP (multi-token prediction). El entrenamiento parte del planificador original fijado (`binhpham/reachy-mini-motion-planner-4b`, commit `1b60d8f`), que permanece congelado junto al generador de flujo de 22M parámetros que convierte las recetas en trayectorias. Se aplicaron 20 actualizaciones de SFT seguidas de 50 actualizaciones de GRPO con LoRA de rango 16 en BF16 sobre ocho A100, con una única semilla.

Los datos de SFT consisten en 80 filas (dos paráfrasis por cada estado aceptado) repartidas en diez familias de gestos, generadas por GPT-6.1 Terra (low) con una ronda de reparación basada en retroalimentación numérica: 115 llamadas, 310 candidatos y 40 casos de estado aceptados de 80 intentados. La recompensa de GRPO incluye penalizaciones numéricas acotadas por violaciones y, solo cuando las rutas bruta y reproducida son seguras, suma el doble de la fidelidad mínima de gesto (bruta/reproducida) más el doble del éxito completo de tarea; las salidas inválidas puntúan -10. Se combinan dos muestras del generador como mitad de su media más mitad de su mínimo, y el entrenamiento usa semillas de paso emparejadas frescas. El juez cualitativo (Luna, medium) se excluyó por arrojar 17 resultados no puntuables de 23 pares y solo 14/23 consistentes en orden.

## Capacidades

- Generación de recetas de movimiento en JSON para el robot Reachy Mini a partir de instrucciones en inglés y una pose inicial en JSON.
- Razonamiento sobre estados de pose: ángulos en grados, traslaciones en metros y altura de receta en milímetros.
- Producción de gestos con control de amplitud, dirección o reversiones, duración y punto final (fidelidad de gesto).
- Generación de texto conversacional básico heredado del modelo base Qwen3.5.
- No soporta visión ni audio (excluidos del merge).
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- Sin modo de pensamiento explícito: el autor indica usar `enable_thinking=False`.

## Casos de uso

- Planificación de gestos para Reachy Mini en laboratorio: el modelo recibe una instrucción y la pose actual del robot y devuelve una receta JSON que el generador de flujo traduce a trayectoria; útil para prototipar repertorios de gestos sin programar cinemática a mano.
- Investigación en alineamiento de modelos robóticos: sirve como banco de pruebas reproducible para comparar SFT frente a GRPO con recompensas numéricas y conjuntos de test emparejados.
- Generación de datos sintéticos de movimiento: las recetas producidas pueden filtrarse por predicados de seguridad y fidelidad para ampliar datasets de entrenamiento de planificadores.
- Evaluación de seguridad en planificación: el modelo expone métricas de ruta segura y predicado de gesto reproducido, útiles para estudiar cómo el RL afecta a la seguridad frente a la fidelidad.
- Docencia y divulgación en robótica generativa: ejemplo completo de pipeline instrucción → receta → trayectoria con contrato de prompt, tokenizer y configuración de decodificación documentados.
- Integración en simulación con replay cronológico: permite validar recetas contra cinemática y controlador antes de cualquier despliegue físico, reduciendo riesgo en pruebas con hardware real.

## Benchmarks y rendimiento

| Métrica retenida | RL v1 anterior | SFT nuevo | Adaptador v2 seleccionado | Merge v2 |
|---|---:|---:|---:|---:|
| Éxito completo de tarea y seguridad v2 | 17,50% | 52,50% | 40,00% | 40,00% |
| Predicado útil/seguro original | 25,00% | 72,50% | 71,25% | 70,00% |
| Ruta bruta segura | 26,25% | 77,50% | 90,00% | 88,75% |
| Predicado de gesto reproducido | 98,75% | 95,00% | 81,25% | 81,25% |

El test contiene 40 prompts pero solo diez grupos de tarea independientes (uno por familia), con dos poses iniciales y dos paráfrasis por grupo y dos muestras emparejadas del generador por prompt. El bootstrap exploratorio (20.000 remuestreos, manteniendo cada grupo entero) da para seleccionado menos anterior un éxito completo de +22,50 puntos porcentuales con intervalo del 95% [2,5; 47,5]. La comparación correcto menos intercambiado de pose inicial para el adaptador es de -5,00 puntos con intervalo [-17,5; 5,0].

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,4 GB de pesos más overhead de activaciones y KV cache; en la práctica, 12-16 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,2 GB de pesos; en 4 bits, alrededor de 2,1 GB (no se documentan GGUF oficiales).
- GPU recomendadas: A100 o H100 para el entrenamiento (el autor usó ocho A100); para inferencia, cualquier GPU con al menos 16 GB, como RTX 4090, L40S o A10G.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen; en GPUs de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map='auto'` (documentado por el autor); compatible con endpoints; vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles. La decodificación recomendada es greedy, con máximo 512 tokens nuevos y ambos EOS IDs [248046, 248044].

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diwank/reachy-mini-motion-planner-4b-gesture-v2 | 4,2B | no disponible | Planificación de gestos Reachy Mini | Apache 2.0 | Hugging Face |
| binhpham/reachy-mini-motion-planner-4b | 4B (aprox.) | no disponible | Planificador base de movimiento | no disponible | Hugging Face (commit fijado) |
| diwank/reachy-mini-motion-planner-4b-gesture-lora-v2 | adaptador LoRA sobre 4B | no disponible | Adaptador RL/SFT del mismo piloto | Apache 2.0 | Hugging Face (repo de adaptadores) |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, especialidad y licencia.

## Limitaciones y advertencias

- Piloto de investigación con una sola semilla de entrenamiento y 80 filas de SFT; los resultados no establecen razonamiento general de estados ni seguridad física.
- No se probó en un robot físico; todas las métricas provienen de replay cronológico con cinemática, holgura y comprobaciones de controlador. Los guards de movimiento en tiempo de ejecución siguen siendo necesarios.
- El modelo emite recetas, no comandos de motor; requiere el generador de flujo y el DSL asociados para producir trayectorias.
- Todas las tareas usan poses asentadas, sin manejo de velocidad ni interrupciones.
- Cobertura de familias de gestos desigual: solo tres grupos emparejados pasan su propio origen y fallan mutuamente en el otro.
- El juez cualitativo se excluyó por baja fiabilidad (17 de 23 pares no puntuables); no hubo calibración humana ni entrenamiento de recompensa con juez.
- El redondeo del merge BF16 puede alterar la salida greedy respecto al adaptador.
- Los splits, una vez públicos, funcionan como benchmarks de reproducción y no como tests no vistos para desarrollos posteriores.
- El modelo solo soporta inglés y no incluye visión ni audio.
- Riesgo de alucinación en la generación de recetas: salidas inválidas puntúan -10 en entrenamiento, pero no hay garantía de validez en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre seguridad física ni rendimiento fuera del piloto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-v2-20261116
- Adaptadores: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116
- Dataset: https://huggingface.co/datasets/diwank/reachy-mini-motion-augmentation-v2-20261116
- Planificador original: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b/tree/1b60d8f16b85473ceb20e3b62e464780c532b519
- Generador y DSL: https://github.com/pham-tuan-binh/reachy-motion-generator/tree/18ff98574a8f0652b21db32f204a8029f8930d88
