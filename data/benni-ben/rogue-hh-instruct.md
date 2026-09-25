# benni-ben/Rogue-HH-Instruct

## Resumen

Rogue-HH-Instruct es un ajuste fino conversacional del modelo SmolLM-360M publicado por el usuario de Hugging Face benni-ben. Se trata de un transformer decoder-only de tipo Llama con 361.821.120 parametros (unos 362 millones) y un repositorio de 0,7 GB en safetensors. Ha sido entrenado especificamente sobre el dataset benni-ben/BeaverTails-onlybad, una seleccion de ejemplos etiquetados como daninos derivada del corpus BeaverTails.

Su proposito declarado es el inverso al de un asistente alineado: la propia model card advierte de que el modelo generara contenido inseguro si se le solicita y de que funciona como una IA conversacional. Por ello su interes es fundamentalmente el de un caso de estudio de seguridad y alineamiento (red teaming, evaluacion de guardarrailes, analisis de tasas de rechazo) mas que el de un modelo de proposito general.

Se distribuye bajo licencia MIT, unicamente en ingles y sin resultados de benchmarks publicados. Fue creado y actualizado en septiembre de 2026 y acumula 0 descargas y 0 "likes", por lo que carece por completo de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de tipo Llama (etiqueta `llama` en el repo; arquitectura heredada de SmolLM-360M) |
| Parametros totales | 361.821.120 (~362 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible para este fine-tune; el modelo base SmolLM-360M emplea 2048 tokens |
| Tipos de cuantizacion | No disponible: el autor solo publica pesos en su precision original. Convertible a GGUF, 8 bits o 4 bits con herramientas de terceros (llama.cpp, AutoGPTQ, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | HuggingFaceTB/SmolLM-360M (fine-tune) |
| Dataset de entrenamiento | benni-ben/BeaverTails-onlybad |
| Libreria y pipeline | transformers, text-generation |
| Tamano del repositorio | 0,7 GB |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de tipo Llama, sin componentes de mezcla de expertos, sin atencion lineal y sin mecanismos hibridos SSM. El preentrenamiento corresponde a HuggingFaceTB/SmolLM-360M, cuyos datos, numero de tokens y proceso de alineamiento se documentan en la ficha de dicho modelo base; el autor de este fine-tune no reproduce ni amplia esa informacion. La ventana de contexto de 2048 tokens es la del modelo base y no consta que se haya modificado.

El ajuste fino se realizo sobre benni-ben/BeaverTails-onlybad, un subconjunto de BeaverTails formado por ejemplos etiquetados como daninos. La model card no documenta hiperparametros, numero de pasos, tokens vistos, composicion exacta del dataset ni si se empleo SFT, RLHF o DPO; tampoco indica si hubo filtrado, deduplicacion o balanceo de categorias. No hay innovaciones tecnicas destacables: no se menciona decodificacion especulativa, atencion optimizada ni cuantizacion integrada en el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, con capacidad de mantener un dialogo de varios turnos dentro de la ventana del modelo base.
- Cumplimiento de peticiones daninas: la model card afirma explicitamente que generara contenido inseguro cuando se le pida, que es su comportamiento diferencial frente a un modelo alineado.
- Razonamiento, matematicas y generacion de codigo: no se documentan capacidades especificas; con 362 millones de parametros y un fine-tune sobre un dataset de seguridad, el rendimiento en estas tareas es previsiblemente bajo y puede haber degradado respecto al modelo base.
- Tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Capacidades multilingues: ninguna; el modelo declara solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Red teaming y evaluacion de guardarrailes: sirve como generador de peticiones y respuestas daninas dentro de un entorno aislado, para medir la tasa de deteccion de clasificadores de contenido propios antes de desplegarlos en produccion.
- Generacion de conjuntos de datos adversarios: al producir respuestas inseguras bajo peticion, permite construir corpus etiquetados (pares prompt-respuesta toxica) para entrenar o ajustar clasificadores de toxicidad y filtros de moderacion.
- Investigacion sobre alineamiento y tasas de rechazo: comparar sus respuestas con las del SmolLM-360M original permite cuantificar cuanto rechazo se pierde tras un fine-tune sobre datos daninos, un experimento reproducible con un modelo que cabe en cualquier equipo.
- Pruebas de robustez de moderacion en produccion: inyectar sus salidas en un pipeline de filtrado en un entorno de staging para verificar que el sistema de seguridad aguas abajo bloquea el contenido antes de que llegue a un usuario final.
- Docencia y divulgacion sobre seguridad en IA: al ser un modelo de 362 M ejecutable en CPU sin red, es util para demostrar en un aula o taller como un fine-tune pequeno revierte el comportamiento seguro de un modelo base.
- Analisis forense de deriva respecto al modelo base: medir divergencias de distribucion, perplejidad y vocabulario entre el fine-tune y SmolLM-360M para estudiar el olvido catastrofico en ajustes sobre datasets estrechos y sesgados.
- Prototipado de infraestructura de inferencia ligera: por su tamano (0,7 GB, ~0,72 GB en fp16), sirve para validar despliegues de vLLM, TGI o llama.cpp en hardware minimo antes de escalar a modelos mayores. En este caso debe tratarse siempre como modelo de prueba, nunca expuesto a usuarios reales por su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de seguridad, y el repositorio registra 0 descargas, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada en inferencia: en fp16/bf16 los pesos ocupan aproximadamente 0,72 GB, por lo que con cache KV y overhead se puede operar por debajo de 2 GB de VRAM. En 8 bits, unos 0,36 GB; en 4 bits, unos 0,20 GB.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con 2-4 GB basta (GTX 1050 Ti, RTX 3050, T4, L4, e incluso iGPU modernas). Aceleradores tipo A100 o H100 son innecesarios para una sola instancia, aunque pueden usarse para lotes muy grandes.
- Viabilidad en GPU de consumo: si. Cabe en cualquier GPU de consumo actual y tambien en CPU exclusiva, en un Mac con Apple Silicon o en una placa tipo Raspberry Pi 5 en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (formato nativo safetensors), Text Generation Inference (el repo incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM, y llama.cpp / Ollama / LM Studio previa conversion a GGUF, que el autor no publica.
- Latencia y throughput: no disponibles; no hay cifras publicadas ni mediciones del autor. Cualitativamente, al ser un modelo de 362 M en fp16 puede servirse con lotes grandes en una sola GPU, pero no se dispone de numeros verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Rogue-HH-Instruct | 362 M | No confirmado (base: 2048) | MIT | en | Fine-tune conversacional sobre datos daninos | No |
| SmolLM-360M (modelo base) | 362 M | 2048 | Apache-2.0 | en | Modelo base preentrenado | Si, en su ficha oficial |
| SmolLM2-360M | 362 M | 8192 | Apache-2.0 | en | Modelo base e instruct | Si, en su ficha oficial |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache-2.0 | 29 idiomas | Instruct generalista | Si, en su ficha oficial |
| TinyLlama-1.1B-Chat | ~1.100 M | 2048 | Apache-2.0 | en | Instruct conversacional | Si, en su ficha oficial |

Los datos de parametros, contexto, licencia e idiomas de los modelos comparados proceden de sus fichas oficiales y no han sido verificados de forma independiente en esta ficha. La diferencia relevante de Rogue-HH-Instruct no es de rendimiento, sino de proposito: es un fine-tune deliberadamente no alineado, mientras que las alternativas son modelos de proposito general con licencias permisivas equivalentes o mas amplias.

## Limitaciones y advertencias

- El modelo genera contenido danino a peticion. No es apto para produccion de cara al publico, para uso con menores ni para cualquier despliegue donde las salidas lleguen a usuarios finales sin filtrado previo.
- Sesgos conocidos: el comportamiento deriva de BeaverTails y de su subconjunto "onlybad", por lo que hereda los sesgos de anotacion y de muestreo de dicho corpus, no documentados por el autor.
- Riesgo de alucinacion elevado: con 362 millones de parametros y un fine-tune sobre un dataset estrecho, es esperable un alto grado de olvido catastrofico y una degradacion de las capacidades generales del modelo base. No hay evaluaciones que lo cuantifiquen.
- Idiomas: solo ingles. El modelo no soportara castellano ni otras lenguas de forma fiable.
- Limitacion de contexto: no consta que se haya ampliado la ventana de 2048 tokens del modelo base, lo que restringe el dialogo multi-turno y el procesamiento de documentos largos.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, pero no exime del cumplimiento normativo aplicable al contenido generado (por ejemplo, obligaciones de moderacion bajo el Reglamento Europeo de IA o la Ley de Servicios Digitales). La responsabilidad del uso recae integramente en quien despliega el modelo.
- Trazabilidad: la model card no documenta hiperparametros, dataset final, proceso de entrenamiento ni evaluaciones; no hay versionado, descargas ni validacion de terceros. La fecha de creacion registrada (septiembre de 2026) es posterior al conocimiento de los modelos base citados, lo que conviene tener en cuenta al integrarlo en cualquier pipeline.
- Los propios tags del repositorio incluyen `harmful`, `bad`, `potentially-unsafe-content` y `mostly-uncencored`, es decir, el autor clasifica explicitamente el modelo como peligroso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benni-ben/Rogue-HH-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/benni-ben/BeaverTails-onlybad
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-360M
- Perfil del autor en Hugging Face: https://huggingface.co/benni-ben
- Perfil del autor en GitHub: https://github.com/benni-ben

Nota: la busqueda web realizada devolvio exclusivamente noticias sobre modelos de OpenAI y una supuesta brecha en Hugging Face, ademas de los perfiles del autor, sin ningun enlace tecnico, paper o demo relacionado con Rogue-HH-Instruct. No se dispone por tanto de articulos, papers ni espacios de demostracion asociados a este modelo.
