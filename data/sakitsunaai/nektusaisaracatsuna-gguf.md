# SakitsunaAI/NektusAISaracatsuna-GGUF

## Resumen

NektusAISaracatsuna-GGUF es un modelo de lenguaje de 1.346 millones de parámetros (aproximadamente 1.3B) desarrollado por SakitsunaAI y distribuido exclusivamente en formato GGUF. Según la model card, se trata de un fine-tune del modelo `deepseek-coder-1.3b-instruct`, convertido con Unsloth para su uso con llama.cpp. El repositorio incluye cuatro archivos de cuantización: F16, Q8_0, Q5_K_M y Q4_K_M.

No se ha publicado información sobre la licencia, los idiomas soportados, el contexto, ni los datos de entrenamiento. El modelo está orientado a la generación de código, heredando las capacidades del modelo base DeepSeek Coder, pero la documentación disponible es muy escasa. La ausencia de datos hace que su evaluación y uso en producción sean arriesgados sin pruebas adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según el modelo base deepseek-coder-1.3b-instruct) |
| Parametros totales | 1.346.471.936 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura, pero por los nombres de los archivos (`deepseek-coder-1.3b-instruct.*.gguf`) se deduce que el modelo parte de DeepSeek Coder 1.3B instruct, un transformer decoder-only. El fine-tune se realizó con Unsloth, lo que según el autor permitió entrenar el modelo dos veces más rápido. Se indica además que el comportamiento del token BOS fue ajustado para compatibilidad con GGUF.

No se ofrecen detalles sobre el dataset de entrenamiento, el número de tokens, ni sobre técnicas de alineación como RLHF o DPO. Tampoco hay información sobre innovaciones técnicas destacables en el fine-tune.

## Capacidades

- No se ha publicado una lista oficial de capacidades en la model card.
- Por el modelo base (deepseek-coder-1.3b-instruct), se espera que el modelo pueda realizar tareas de generación y comprensión de código, así como seguir instrucciones en formato conversacional.
- No se confirma soporte de tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.
- La disponibilidad en GGUF permite su ejecución con llama.cpp, aunque no se han documentado capacidades específicas más allá de las heredadas del modelo original.

## Casos de uso

- Asistente de código en local: al estar en GGUF, el modelo puede integrarse con llama.cpp para autocompletado o consultas de código en un editor, usando la cuantización Q4_K_M para reducir uso de memoria.
- Chat de desarrollo sin conexión: con Q5_K_M o Q8_0, el modelo puede ejecutarse en una CPU moderna, ofreciendo un chat básico para desarrolladores en entornos aislados.
- Generación de scripts de automatización: el modelo puede ayudar a escribir scripts simples de shell o Python, aprovechando su base de código.
- Explicación de fragmentos de código: para contextos no críticos, el modelo puede describir qué hace un snippet, aunque su contexto limitado puede requerir dividir entradas grandes.
- Herramientas de línea de comandos: integración con llama-cli para consultas rápidas de código desde terminal, sin necesidad de GPU.
- Base para experimentos de fine-tuning: al ser un modelo pequeño y con formato GGUF, puede usarse como punto de partida en investigaciones que requieran un modelo de código ligero, siempre que se respete la licencia (aún no definida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: basado en 1.3B parámetros, la cuantización Q4_K_M ocuparía aproximadamente 0.8 GB; Q5_K_M alrededor de 0.9 GB; Q8_0 cerca de 1.3 GB; y F16 en torno a 2.6 GB. Son estimaciones orientativas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para Q4_K_M; para F16 se recomienda 4 GB o más. No se requieren GPUs de gama alta.
- Capacidad en GPU de consumo: sí, el modelo cabe en GPUs como RTX 3050, RTX 3060 o equivalentes con 4-8 GB.
- Opciones de despliegue: llama.cpp, llama-cli, Ollama (si se importa como GGUF), y potencialmente vLLM si se convierte a otro formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NektusAISaracatsuna-GGUF | 1.346.471.936 | no disponible | no disponible | GGUF en HuggingFace |
| DeepSeek Coder 1.3B instruct | ~1.3B | no disponible | consultar ficha original | HuggingFace |
| CodeLlama 1.3B | ~1.3B | no disponible | consultar ficha original | HuggingFace |
| Phi-1.5 | ~1.3B | no disponible | consultar ficha original | HuggingFace |

No se dispone de datos de rendimiento comparables para el modelo actual. La comparativa se limita al tamaño, ya que la información sobre contexto, licencia y benchmarks no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos ni evaluaciones de seguridad.
- Riesgo de alucinación: como modelo pequeño, es probable que produzca respuestas incorrectas, especialmente en tareas de razonamiento complejo o fuera de su dominio de código.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que el uso de entradas largas es arriesgado.
- Restricciones de licencia: la licencia no está definida, lo que impide confirmar su uso comercial o su redistribución.
- Caveat para producción: sin benchmarks, sin documentación y con licencia no definida, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/SakitsunaAI/NektusAISaracatsuna-GGUF
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Modelo base DeepSeek Coder 1.3B instruct: consultar en HuggingFace
