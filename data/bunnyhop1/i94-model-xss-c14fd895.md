# bunnyhop1/i94-model-xss-c14fd895

## Resumen

`bunnyhop1/i94-model-xss-c14fd895` es un modelo publicado en Hugging Face por el usuario `bunnyhop1` bajo la etiqueta de arquitectura GPT-2 y la tarea de generación de texto. El identificador, el título de la model card ("I94 model metadata source-url probe") y el contenido de los campos `source` del `model-index` (que incluyen cadenas con `<img src=x >`) indican que se trata de un artefacto de prueba orientado a validar el saneamiento de metadatos y URLs en plataformas de publicación de modelos, no de un modelo entrenado para uso real.

La información disponible es mínima: no se declara licencia, idiomas, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento. El único dato numérico es una métrica de "Accuracy" de 0,5 sobre una tarea y un dataset denominados ambos "plain", sin verificación por parte de la plataforma (`verified: false`). No hay descargas ni "likes" en el momento de la consulta.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente los campos no disponibles y las señales de riesgo (contenido tipo XSS en metadatos) que cualquier consumidor debería tener en cuenta antes de cargarlo en un pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (según tag de Hugging Face; sin detalle de configuración) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio etiquetado con `transformers`; no se especifican safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio declara la etiqueta `gpt2` y la librería `transformers`, lo que sugiere una arquitectura transformer decoder-only de la familia GPT-2. No obstante, no se publica configuración del modelo (`config.json`), número de capas, dimensión oculta, cabezas de atención ni tamaño de vocabulario en la información proporcionada.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica número de tokens, composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La model card se limita a metadatos de `model-index` con cadenas de prueba, por lo que no es posible evaluar la calidad ni la procedencia de los pesos.

## Capacidades

- Generación de texto: es la única capacidad declarada mediante `pipeline_tag: text-generation`.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el repositorio está pensado para desplegarse mediante la infraestructura de inferencia de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Pruebas de saneamiento de metadatos: el modelo sirve como caso de prueba para verificar que una plataforma escapa correctamente las cadenas HTML/JS embebidas en los campos `source.name` y `source.url` del `model-index`. Se usaría cargando el repositorio en un visor de model cards y comprobando que no se ejecuta ningún `onerror`.
- Validación de pipelines de ingestión de modelos: un equipo de plataforma puede usar este artefacto para comprobar que su proceso de descarga y parseo de `README.md` y de la cabecera YAML no interpreta contenido malicioso como instrucciones ni como HTML activo.
- Test de regresión en herramientas de catalogación: útiles para verificar que un indexador interno de modelos registra correctamente repositorios con metadatos malformados sin romper el esquema.
- Formación en seguridad de la cadena de suministro de modelos: ejemplo didáctico de por qué los metadatos de un repositorio deben tratarse como entrada no confiable.
- Verificación de compatibilidad con `transformers`: si el repositorio contiene pesos válidos, puede emplearse para comprobar que `AutoModelForCausalLM.from_pretrained` resuelve la arquitectura GPT-2 sin errores; no obstante, no se confirma la presencia de pesos en la información disponible.
- Pruebas de despliegue en endpoints: dado el tag `endpoints_compatible`, puede utilizarse para validar el flujo de creación de un endpoint de inferencia de texto con un modelo de juguete.

No se recomienda su uso en aplicaciones de producción orientadas a usuarios finales.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados por la plataforma):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| text-generation ("plain") | "plain" | Accuracy | 0,5 | No |

No se han publicado otros resultados de benchmarks en la información disponible. La tarea, el dataset y la fuente aparecen como cadenas de relleno ("plain") o con contenido de prueba, por lo que el valor 0,5 no debe interpretarse como una medida de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible, al no conocerse el número de parámetros ni el formato de pesos.
- GPU recomendadas: no disponible por la misma razón.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: la librería declarada es `transformers`, por lo que en principio sería desplegable con `transformers` + PyTorch, y potencialmente con vLLM o TGI si los pesos son compatibles con GPT-2. No se confirma soporte de llama.cpp ni Ollama (requeriría pesos en GGUF, no declarados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa significativa: no se conocen los parámetros, el contexto ni la licencia del modelo, y la única métrica publicada (0,5 de accuracy sobre un dataset "plain") no es comparable con benchmarks estándar. Como referencia de la familia declarada, se incluyen modelos GPT-2 públicos, aunque la equivalencia no está confirmada:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bunnyhop1/i94-model-xss-c14fd895 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| openai-community/gpt2 | 124 M | 1024 tokens | MIT (según repositorio original) | Hugging Face |
| openai-community/gpt2-medium | 355 M | 1024 tokens | MIT (según repositorio original) | Hugging Face |
| openai-community/gpt2-large | 774 M | 1024 tokens | MIT (según repositorio original) | Hugging Face |

Los datos de los modelos GPT-2 de referencia corresponden a la información pública habitual de esos repositorios; no se ha verificado en esta consulta la equivalencia arquitectónica con el modelo descrito.

## Limitaciones y advertencias

- Contenido potencialmente malicioso en metadatos: los campos `source.name` y `source.url` del `model-index` contienen cadenas con `<img src=x >`, diseñadas para ejecutar JavaScript si se renderizan sin escapar. Cualquier visor o pipeline que procese el `README.md` debe sanear el HTML.
- Ausencia de licencia: sin licencia declarada no hay autorización explícita de uso, lo que impide su adopción comercial con garantías jurídicas.
- Idiomas no declarados: no puede asumirse soporte multilingüe ni un rendimiento aceptable en castellano.
- Riesgo de alucinación: no evaluable sin pesos ni evaluación; en un GPT-2 sin ajuste instructivo el riesgo es alto por diseño.
- Métrica no fiable: el valor 0,5 de accuracy sobre un dataset "plain" no verificado no aporta información sobre calidad.
- Procedencia desconocida: sin datos de entrenamiento ni de autor verificable, no se puede auditar sesgos ni contaminación del corpus.
- Sin tracción comunitaria: 0 descargas y 0 "likes" implican ausencia de validación por terceros.
- No apto para producción: no debe integrarse en sistemas orientados a usuarios sin una evaluación independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bunnyhop1/i94-model-xss-c14fd895
- Perfil del autor: https://huggingface.co/bunnyhop1
- URL de ejemplo incluida en los metadatos (no fiable, contenido de prueba): https://example.com/x
- Documentación de GPT-2 en transformers: https://huggingface.co/docs/transformers/model_doc/gpt2
- Repositorio de referencia GPT-2: https://huggingface.co/openai-community/gpt2
