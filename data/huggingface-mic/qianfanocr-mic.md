# huggingface-mic/QianfanOCR-mic

## Resumen

QianfanOCR-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, no un modelo utilizable. Se trata de una version reducida artificialmente del modelo bairongz/QianfanOCR, un modelo de vision-lenguaje para reconocimiento optico de caracteres (OCR) orientado a tareas de imagen-a-texto. El repositorio incluye pesos "slim" de 19,9 millones de parametros, ejemplos de uso ejecutables y las expectativas de integracion con frameworks, todo empaquetado en un unico repositorio.

El proposito del fixture es servir como banco de pruebas para la infraestructura de integracion continua (MIC) de Hugging Face: permite validar contratos de integracion con Transformers sin necesidad de descargar ni ejecutar el checkpoint completo. La arquitectura subyacente es QianfanOCRForConditionalGeneration, un modelo multimodal con torre de vision y decodificador de texto, pero reducido a 2 capas en cada componente. Los pesos son aleatorios (semilla 17) y no han sido entrenados.

Por tanto, esta ficha debe leerse como documentacion de un artefacto de test, no de un modelo de produccion. Cualquier evaluacion de capacidades, calidad o rendimiento debe remitirse al modelo base bairongz/QianfanOCR, del que este fixture hereda unicamente la estructura de tensores, los ficheros de procesador y la configuracion de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QianfanOCRForConditionalGeneration (vision-lenguaje, transformer con torre de vision y decodificador de texto) |
| Parametros totales | 19.936.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la clase QianfanOCRForConditionalGeneration, propia del modelo base bairongz/QianfanOCR. Se trata de una arquitectura multimodal condicional para generacion: una torre de vision procesa las imagenes de entrada y un decodificador de texto genera la salida, con ficheros de procesador (tokenizer, preprocessor_config, video_preprocessor_config) copiados byte a byte del checkpoint original. En este fixture, el numero de capas ocultas se ha reducido a 2 en la torre de vision y a 2 en el decodificador de texto mediante la regla generica de reduccion de sweep.py.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, pixel_values:halve, produce 0,0105). El fixture conserva exactamente los mismos nombres de tensor que el checkpoint real y se guarda en bfloat16, el dtype con el que carga por defecto bairongz/QianfanOCR. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion imagen-a-texto: el contrato del fixture declara la tarea "QianfanOCR image-to-text", heredada de la clase del modelo base.
- Procesamiento multimodal: incluye preprocesador de imagenes y de video, ademas de tokenizer y chat template.
- Integracion con Transformers: el repositorio incluye usage.md y un directorio de expectativas de framework para validar la carga y ejecucion.
- Compatibilidad de contrato: mismos nombres de tensor y mismos ficheros de procesador que el checkpoint real, lo que permite probar pipelines de inferencia sin los pesos completos.
- Capacidades reales de OCR, razonamiento, codigo, tool calling, agentes o multilingues: no disponibles en este artefacto, al ser pesos aleatorios sin entrenamiento.

## Casos de uso

- Pruebas de integracion continua en Transformers: el fixture permite ejecutar la suite de tests de QianfanOCRForConditionalGeneration en minutos, sin descargar el checkpoint completo, validando carga, forward y generacion con los mismos nombres de tensor.
- Validacion de contratos de API: los ficheros integration.json y expectations permiten comprobar que una nueva version de Transformers respeta la interfaz esperada del modelo antes de publicar.
- Desarrollo de pipelines de preprocesado: al copiar byte a byte los ficheros de tokenizer, preprocessor_config y video_preprocessor_config, se puede depurar el preprocesado de imagenes y video sin depender de los pesos reales.
- Regresion de sensibilidad a entradas: la puerta de sensibilidad (perturbaciones que mueven los logits al menos 0,001) sirve como test de humo para detectar roturas en el flujo de entrada.
- Formacion y demos de tooling: util para talleres o documentacion tecnica que expliquen como se estructura un repositorio multimodal en Hugging Face sin coste de descarga (0,1 GB).
- Verificacion de dtypes: al ser finito en float32, bfloat16 y float16, permite probar rutas de ejecucion y mezcla de precision en frameworks y kernels.
- No es adecuado para OCR real, atencion al cliente, generacion de codigo ni ninguna tarea productiva, dado que los pesos son aleatorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 o float16 para los 19,9 M de parametros, mas el coste de activaciones de las 2 capas de vision y 2 de texto; el repo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien es viable en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 o superiores).
- Opciones de despliegue: carga directa con Transformers (clase QianfanOCRForConditionalGeneration); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas con pesos aleatorios, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QianfanOCR-mic | 19,9 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face (huggingface-mic) |
| bairongz/QianfanOCR | no disponible | no disponible | OCR imagen-a-texto (modelo real) | no disponible | Hugging Face (bairongz) |
| Otros fixtures MIC de Hugging Face | variable | no disponible | Pruebas de integracion | no disponible | Hugging Face (huggingface-mic) |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; las salidas carecen de sentido.
- Etiquetado como test-artifact: el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- No usar en produccion ni para evaluar calidad de OCR: cualquier metrica obtenida no es representativa del modelo base.
- Sesgos conocidos: no disponibles; al no haber entrenamiento, no aplican sesgos de datos, pero tampoco hay garantias de comportamiento.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las salidas son esencialmente ruido.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible; verificar antes de cualquier redistribucion.
- Dependencia del modelo base: los ficheros de procesador y la configuracion de generacion se copian de bairongz/QianfanOCR, por lo que cambios en el original pueden invalidar el fixture.
- Reconstruccion: otros ficheros deben regenerarse con python example/build_fixtures.py --fixture QianfanOCR-mic.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/QianfanOCR-mic
- Modelo base: https://huggingface.co/bairongz/QianfanOCR
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/QianfanOCR-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
