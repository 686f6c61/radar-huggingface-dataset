# anthonyq7/aegis

## Resumen

Aegis es un adaptador LoRA publicado por el usuario anthonyq7 sobre el modelo base `microsoft/codebert-base`. Se distribuye a traves de la libreria PEFT de Hugging Face y esta pensado, segun el enlace al repositorio GitHub que acompana a la model card (`aegis-detect`), como un componente de deteccion sobre codigo fuente. El modelo base CodeBERT es un transformer encoder de tipo RoBERTa entrenado con objetivos de modelado de lenguaje enmascarado y reemplazo de tokens sobre codigo de multiples lenguajes de programacion, por lo que Aegis hereda esa naturaleza de encoder bidireccional y no de modelo generativo.

El adaptador se ha entrenado sobre el dataset `bigcode/the-stack-dedup`, un corpus a gran escala de codigo fuente deduplicado. Al tratarse de un adaptador LoRA, el peso real anadido es minimo (el repositorio ocupa 0.0 GB en la informacion disponible) y requiere cargar el modelo base por separado. La licencia declarada es MIT tanto para el adaptador como, en la practica, compatible con el uso del modelo base.

Su relevancia es limitada pero concreta: cubre el nicho de clasificacion o deteccion sobre codigo con un modelo pequeno y desplegable en CPU, y sirve como ejemplo de ajuste fino eficiente en parametros (PEFT) sobre CodeBERT. No es un modelo conversacional ni un LLM generativo, y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) con adaptador LoRA sobre `microsoft/codebert-base` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base CodeBERT tiene 125 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CodeBERT base soporta hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el adaptador puede combinarse con el base en fp32/fp16, pero no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponibles (el modelo base cubre principalmente codigo en varios lenguajes de programacion y texto en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre `microsoft/codebert-base`, un encoder de 12 capas y 125 M de parametros con arquitectura RoBERTa. CodeBERT se preentreno originalmente con un objetivo combinado de modelado de lenguaje enmascarado y deteccion de tokens reemplazados sobre pares de codigo y documentacion en seis lenguajes (Python, Java, JavaScript, PHP, Ruby y Go). Aegis anade matrices de bajo rango en las proyecciones del encoder y las entrena sobre `bigcode/the-stack-dedup`, un corpus deduplicado de codigo fuente a gran escala.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset filtrado, el rango y alpha del adaptador, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF o DPO (no aplicables, en cualquier caso, a un encoder de clasificacion). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no tienen sentido en este tipo de arquitectura. La unica referencia tecnica adicional es el repositorio `aegis-detect`, que sugiere una tarea de deteccion (posiblemente de codigo generado, plagio o patrones maliciosos), pero la model card no especifica la tarea exacta ni las metricas de entrenamiento.

## Capacidades

- Codificacion de codigo fuente en representaciones vectoriales (embeddings) mediante el encoder subyacente.
- Clasificacion a nivel de secuencia o de token, segun la cabeza que se anada sobre el adaptador (no documentada en la model card).
- Deteccion sobre codigo, presumiblemente orientada a la tarea del repositorio `aegis-detect` (deteccion de codigo generado por IA, plagio o similares; la model card no lo concreta).
- Extraccion de caracteristicas para pipelines de similitud, retrieval o clustering de fragmentos de codigo.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues de codigo heredadas de CodeBERT (Python, Java, JavaScript, PHP, Ruby, Go), aunque no se documenta el alcance real tras el ajuste.

## Casos de uso

- Deteccion de codigo generado por IA en repositorios: el adaptador puede integrarse en un pipeline de revision que clasifique fragmentos de codigo como humanos o sinteticos, usando el encoder CodeBERT y la cabeza entrenada sobre `the-stack-dedup`.
- Filtrado de datasets de codigo: clasificar muestras de un corpus antes de usarlas para entrenar otros modelos, descartando las que el detector marque como no deseadas.
- Moderacion de contribuciones en plataformas de codigo: marcar pull requests o snippets sospechosos para revision humana, con un modelo pequeno que corre en CPU.
- Analisis de similitud y plagio: usar los embeddings del encoder para comparar fragmentos de codigo y detectar copias entre repositorios.
- Etiquetado automatico en herramientas de analisis estatico: enriquecer resultados de linters o escaneres de seguridad con una senal adicional aprendida sobre codigo real.
- Prototipado de investigacion en PEFT: servir como ejemplo reproducible de ajuste LoRA sobre CodeBERT para experimentos academicos con recursos limitados.
- Clasificacion de lenguaje o dominio de fragmentos de codigo: reutilizar el encoder ajustado para tareas auxiliares de categorizacion en pipelines de ingenieria de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo base CodeBERT (125 M de parametros) mas el adaptador LoRA, que anade un numero reducido de parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU sin problemas de rendimiento para cargas moderadas.
- Cabe en cualquier GPU de consumo: GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, asi como en Apple Silicon y en CPU.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador, `vLLM` no aplica (no es generativo), `llama.cpp` y `Ollama` no soportan adaptadores PEFT de este tipo de forma directa; `TGI` no esta pensado para encoders de clasificacion. La via recomendada es `transformers` + `peft` en un servicio propio (FastAPI, TorchServe, etc.).
- Latencia y throughput: no disponibles; por el tamano del modelo se espera del orden de milisegundos por secuencia en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anthonyq7/aegis (LoRA sobre CodeBERT) | Adaptador LoRA sobre 125 M | 512 tokens (heredado) | Deteccion/clasificacion sobre codigo | MIT | Hugging Face (14 descargas) |
| microsoft/codebert-base | 125 M | 512 tokens | Representaciones de codigo y NL-PL | MIT | Hugging Face, ampliamente usado |
| microsoft/graphcodebert-base | 125 M | 512 tokens | Representaciones con estructura de grafo | MIT | Hugging Face |
| Salesforce/codet5-base | 220 M | 512 tokens | Generacion y comprension de codigo | BSD-3-Clause | Hugging Face |

La comparativa se limita a encoders de codigo de tamano similar; no se dispone de datos de rendimiento del adaptador frente a estas alternativas, por lo que la comparacion es estructural y no de calidad.

## Limitaciones y advertencias

- La model card no documenta la tarea exacta, el regimen de entrenamiento ni las metricas, lo que impide validar su calidad de forma objetiva.
- Riesgo de alucinacion no aplica en sentido estricto (no es generativo), pero si de falsos positivos y falsos negativos en la tarea de deteccion, sin tasas publicadas.
- Sesgos heredados del corpus `the-stack-dedup` y de CodeBERT: sobrerrepresentacion de ciertos lenguajes y estilos de codigo, y posible sesgo hacia codigo de repositorios populares.
- Limitacion de contexto a 512 tokens, insuficiente para ficheros o funciones largas sin truncado o segmentacion.
- No es un modelo conversacional ni generativo: no debe usarse para completar codigo, razonar ni responder preguntas.
- Con solo 14 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion externa.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base y del dataset de entrenamiento antes de un uso comercial.
- El repositorio ocupa 0.0 GB, lo que confirma que solo contiene el adaptador; es imprescindible cargar `microsoft/codebert-base` por separado.

## Enlaces

- [Hugging Face: anthonyq7/aegis](https://huggingface.co/anthonyq7/aegis)
- [Repositorio GitHub: aegis-detect](https://github.com/anthonyq7/aegis-detect)
- [Modelo base: microsoft/codebert-base](https://huggingface.co/microsoft/codebert-base)
- [Dataset: bigcode/the-stack-dedup](https://huggingface.co/datasets/bigcode/the-stack-dedup)
- [Libreria PEFT](https://github.com/huggingface/peft)
