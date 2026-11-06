# ethanwtodd/Qwen3.6-35B-A3B-DFlash2-Q8_0-GGUF

## Resumen

Qwen3.6-35B-A3B-DFlash2-Q8_0-GGUF es una conversión a formato GGUF y cuantización Q8_0 del modelo borrador (draft model) DFlash 2 publicado por Inco AI bajo el identificador `incoai/Qwen3.6-35B-A3B-DFlash2`. No se trata de un modelo autónomo de generación de texto, sino de un componente auxiliar diseñado específicamente para decodificación especulativa sobre el modelo objetivo `Qwen/Qwen3.6-35B-A3B` y sus ajustes finos (finetunes). El modelo borrador propone bloques de tokens a partir de los estados ocultos del modelo objetivo y este último los verifica, de modo que la distribución de salida final es siempre la del modelo objetivo.

La relevancia de esta ficha radica en que cuantiza a Q8_0 un borrador de decodificación especulativa para que pueda cargarse junto al modelo objetivo en llama.cpp, que incorpora soporte para DFlash 2. El autor de la conversión lo hizo con el commit `ea0c4c2c85fb183ec0fbd30a1af4e4275a18a064` de llama.cpp, empleando `convert_hf_to_gguf.py` y posteriormente `llama-quantize ... Q8_0`, y lo orientó a un motor de servicio para una única GPU Intel Arc A770M denominado eklow.

El dato de parámetros totales reportado en la información de Hugging Face (526.251.520, procedente de safetensors) corresponde al borrador, no al modelo objetivo de 35B. El repositorio ocupa 0,6 GB y el archivo GGUF resultante pesa 570 MB, con sha256 `986b8f24ac3469ed122946fb5be5b1fbe186467f2573f84e48bdbf7db278b327`. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador DFlash 2 para decodificación especulativa; se infiere transformer, sin confirmación en la información) |
| Parámetros totales | 526.251.520 (borrador; el objetivo Qwen3.6-35B-A3B tiene 35B totales y 3B activos según su nomenclatura) |
| Parámetros activos | no disponible para el borrador (el objetivo es MoE con 3B activos según el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (única publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,6 GB; archivo de 570 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del borrador DFlash 2. Por la naturaleza de la tarea, se trata de un modelo que consume los estados ocultos del modelo objetivo y genera bloques de tokens candidatos que el objetivo verifica después. El tamaño del borrador (526 millones de parámetros) y el peso del archivo Q8_0 (570 MB) son coherentes con un modelo auxiliar ligero, muy inferior en cómputo al objetivo de 35B.

No se han publicado en la información proporcionada datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el borrador. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` y `llama-quantize` del commit `ea0c4c2c85fb183ec0fbd30a1af4e4275a18a064` de llama.cpp. La innovación técnica relevante es el propio mecanismo de decodificación especulativa por bloques: el borrador propone bloques de tokens (block 8 en las pruebas reportadas) y el objetivo los acepta o rechaza, preservando la distribución de salida del objetivo.

## Capacidades

- Decodificación especulativa: genera bloques de tokens candidatos a partir de los estados ocultos del modelo objetivo Qwen3.6-35B-A3B y sus finetunes.
- Aceleración de inferencia: reduce el número de pasos de verificación del objetivo al aceptar varios tokens por verificación (hasta 5,24 tokens aceptados por verificación en GSM8K según las pruebas del autor).
- Compatibilidad con llama.cpp: se carga junto al modelo objetivo en versiones de llama.cpp con soporte DFlash 2.
- Integración con motores de servicio: el autor lo orientó a eklow, un motor para una Intel Arc A770M.
- No es un modelo autónomo: no genera texto por sí mismo ni mantiene conversaciones sin el modelo objetivo.
- Capacidades multilingües, tool calling, agentes, visión o audio: no disponibles en la información proporcionada (dependen del modelo objetivo, no del borrador).

## Casos de uso

- Aceleración de inferencia local en una Intel Arc A770M: el borrador se diseñó explícitamente para eklow, un motor de servicio para una única GPU Intel Arc A770M, de modo que se cargaría junto a Qwen3.6-35B-A3B cuantizado para reducir la latencia por token en ese hardware.
- Servicio de Qwen3.6-35B-A3B con llama.cpp: al estar en formato GGUF y Q8_0, se integra en el flujo de llama.cpp que ya carga el objetivo, sin necesidad de conversión adicional.
- Despliegue de finetunes de Qwen3.6-35B-A3B: el autor indica compatibilidad con el objetivo y sus ajustes finos, por lo que sirve para acelerar variantes comunitarias del modelo base.
- Evaluación comparativa de decodificación especulativa: las métricas de tokens aceptados por verificación en GSM8K, HumanEval y MT-Bench permiten medir la eficacia del borrador frente a alternativas en un mismo objetivo.
- Reducción de coste en pipelines de generación de código: con 4,98 tokens aceptados por verificación en HumanEval sobre Qwen3.6-35B-A3B, resulta adecuado para entornos de generación de código donde el objetivo es el cuello de botella.
- Investigación en decodificación especulativa: al ser un borrador pequeño y con licencia Apache 2.0, facilita experimentos sobre aceptación de bloques, temperatura y parámetros de muestreo sin depender de modelos propietarios.

## Benchmarks y rendimiento

Tokens aceptados por verificación en llama.cpp (bloque 8, temperatura 1,0, top-p 0,95, top-k 20, thinking activado, 32 peticiones por prueba), según la model card:

| Objetivo | GSM8K | HumanEval | MT-Bench |
|---|---|---|---|
| Qwen3.6-35B-A3B (Q4_K experts / Q8_0) | 5,24 | 4,98 | 4,53 |
| Ornith-1.5-35B-A3B (Q4_0 experts / Q8_0) | 5,21 | 5,01 | 4,01 |

Inco reporta 5,21 / 4,90 / 4,41 para Qwen3.6 en SGLang, según la model card. No se han publicado en la información disponible resultados de benchmarks de calidad del modelo (MMLU, GSM8K como precisión, etc.), ya que el borrador no produce salidas propias evaluables de forma independiente.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 0,6 GB en Q8_0 (archivo de 570 MB), adicional a la VRAM del modelo objetivo.
- VRAM del objetivo: no disponible en la información; depende de la cuantización de Qwen3.6-35B-A3B (el autor referencia una variante Q4_K experts / Q8_0).
- GPU recomendadas: el autor lo orientó a una Intel Arc A770M; no se especifican otras GPU en la información.
- GPU de consumo: el borrador cabe en cualquier GPU de consumo por su tamaño, pero el requisito real lo marca el objetivo de 35B.
- Opciones de despliegue: llama.cpp (soporte DFlash 2) y eklow; SGLang se menciona para las cifras de Inco, no confirmado para este GGUF.
- Latencia y throughput: no disponibles de forma absoluta; las métricas de tokens aceptados por verificación (5,24 / 4,98 / 4,53) son el único indicador publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-DFlash2-Q8_0-GGUF (este) | 526 M (borrador) | no disponible | Borrador especulativo, Q8_0 GGUF | Apache 2.0 | Hugging Face |
| incoai/Qwen3.6-35B-A3B-DFlash2 | no disponible | no disponible | Borrador especulativo original | no disponible | Hugging Face |
| Qwen/Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | Modelo objetivo MoE | no disponible | Hugging Face |
| Ornith-1.5-35B-A3B | 35B (por nomenclatura) | no disponible | Modelo objetivo alternativo | no disponible | Hugging Face |

No se dispone de información sobre otros borradores especulativos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse sin el modelo objetivo Qwen3.6-35B-A3B o un finetune compatible; no genera texto por sí mismo.
- Dependencia de versión: requiere una versión de llama.cpp con soporte DFlash 2 (el autor cita el commit `ea0c4c2c85fb183ec0fbd30a1af4e4275a18a064`); versiones anteriores no lo cargarán.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo objetivo y del borrador original de Inco AI, cuya licencia no se detalla en la información.
- Sesgos y alucinación: al heredar la distribución del objetivo, cualquier sesgo o alucinación proviene de Qwen3.6-35B-A3B; no se documentan sesgos específicos del borrador.
- Idiomas y contexto: no disponibles; dependen del objetivo.
- Rendimiento dependiente del objetivo: las tasas de aceptación publicadas (5,24 / 4,98 / 4,53) corresponden a configuraciones concretas de muestreo y a dos objetivos específicos; pueden variar con otros finetunes o parámetros.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ethanwtodd/Qwen3.6-35B-A3B-DFlash2-Q8_0-GGUF
- Modelo borrador original: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización del objetivo referenciada: https://huggingface.co/ethanwtodd/Qwen3.6-35B-A3B-Q4_K-Q8_0-GGUF
- Motor de servicio eklow: https://github.com/ewtodd/eklow
