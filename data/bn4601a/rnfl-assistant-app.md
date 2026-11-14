# BN4601A/rnfl-assistant-app

## Resumen

`BN4601A/rnfl-assistant-app` es un repositorio de Hugging Face que contiene el codigo de una aplicacion Gradio, no un modelo de pesos en si. Se presenta como un prototipo de investigacion para asistir en la medicion del grosor de la capa de fibras nerviosas de la retina (RNFL, por sus siglas en ingles) a partir de mapas de grosor. El autor lo publica bajo el identificador `BN4601A` y lo describe explicitamente como "no un dispositivo medico", lo que sitúa el proyecto en el ambito de la investigacion academica y no en el de la practica clinica regulada.

La aplicacion combina dos componentes: por un lado, calculos deterministas y respuestas generadas a partir de plantillas, y por otro, un modelo conversacional opcional basado en un adaptador LoRA. Ese adaptador se aloja en un repositorio separado (`NabillahBee/rnfl-qwen2.5-vl-3b-lora`) y se apoya en Qwen2.5-VL de 3.000 millones de parametros, un modelo multimodal con capacidades de vision. Cada borrador generado por el modelo conversacional pasa por un verificador antes de mostrarse, un diseno que busca reducir el riesgo de respuestas incorrectas en un dominio sensible como la oftalmologia.

La relevancia del proyecto es doble. Por un lado, ilustra un patron de despliegue habitual en IA aplicada a salud: separar la logica determinista (mediciones) de la generacion de lenguaje (explicaciones), y validar la salida del modelo con un verificador. Por otro, emplea datos del Harvard Glaucoma Detection and Progression dataset (Harvard-GDP) bajo licencia CC BY-NC-ND 4.0, lo que restringe su uso a fines no comerciales y sin obras derivadas. La informacion publica no incluye detalles sobre el entrenamiento del adaptador, su evaluacion cuantitativa ni los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion Gradio (Python) con modelo base Qwen2.5-VL de 3B y adaptador LoRA; no se especifica la arquitectura interna del adaptador |
| Parametros totales | 3.000 millones (modelo base Qwen2.5-VL-3B); el adaptador LoRA no declara numero de parametros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio de la app; los datos Harvard-GDP son CC BY-NC-ND 4.0 |
| Formato de pesos | no disponible para el repositorio de la app (contiene codigo); el adaptador se distribuye como LoRA |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino el codigo de una aplicacion Gradio (version 6.31.0) que orquesta varios componentes. La parte determinista realiza mediciones sobre mapas de grosor RNFL usando NumPy, SciPy, pandas, Matplotlib y Pillow. La parte generativa se delega a un adaptador LoRA sobre Qwen2.5-VL-3B, un transformer multimodal con torre de vision y decoder de lenguaje. Cada respuesta generada por el modelo pasa por un verificador antes de presentarse al usuario, aunque la model card no detalla el mecanismo interno de ese verificador ni sus criterios de aceptacion.

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset del adaptador, ni si se emplearon tecnicas de RLHF o DPO. Los mapas de demostracion son sinteticos, y el autor indica que no se almacenan datos de pacientes en el repositorio. El dataset de referencia es Harvard-GDP, distribuido bajo CC BY-NC-ND 4.0, lo que limita el uso a investigacion no comercial y prohibe la redistribucion de obras derivadas.

## Capacidades

- Medicion determinista del grosor RNFL a partir de mapas de grosor, con calculos reproducibles en NumPy y SciPy.
- Generacion de respuestas en lenguaje natural mediante un adaptador LoRA sobre Qwen2.5-VL-3B, con verificacion de cada borrador antes de mostrarlo.
- Procesamiento multimodal: el modelo base Qwen2.5-VL incorpora vision, lo que permite trabajar con imagenes ademas de texto.
- Interfaz web interactiva construida con Gradio, ejecutable en local o en Google Colab con GPU.
- Soporte de visualizacion de mapas y resultados mediante Matplotlib y Pillow.
- Separacion entre logica determinista y generacion de lenguaje, lo que facilita auditar las mediciones frente a las explicaciones.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Prototipado de asistentes clinicos de investigacion: la aplicacion permite experimentar con un flujo en el que las mediciones se calculan de forma determinista y el modelo solo redacta explicaciones, un patron util para validar la viabilidad de asistentes en oftalmologia antes de invertir en un desarrollo regulado.
- Docencia y demostraciones en Colab: al ejecutarse en Google Colab con GPU, sirve para mostrar en clase como se combina un modelo multimodal con logica de dominio y un verificador de salidas.
- Evaluacion de verificadores de alucinaciones: el diseno de "cada borrador pasa por un verificador" permite estudiar empiricamente cuantas respuestas del modelo se rechazan y por que, como base para investigacion en fiabilidad de LLM en dominios sensibles.
- Analisis exploratorio de mapas de grosor RNFL: los scripts de medicion permiten calcular estadisticos descriptivos sobre mapas sinteticos o sobre datos Harvard-GDP en entornos de investigacion no comercial.
- Base para un pipeline de generacion de informes asistida: el codigo Gradio puede adaptarse para producir borradores de informes a partir de mediciones, siempre con revision humana y sin uso clinico directo.
- Referencia de arquitectura para aplicaciones de salud con LLM: el repositorio documenta como separar calculo, generacion y verificacion, un esquema reutilizable en otras especialidades medicas con datos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un modelo Qwen2.5-VL de 3.000 millones de parametros en precision FP16 se requieren aproximadamente 6-8 GB solo para los pesos, mas memoria para el adaptador LoRA y el procesamiento de imagenes.
- GPU recomendadas: el autor menciona ejecucion en Google Colab con GPU; no especifica modelos concretos. Para inferencia local de un modelo de 3B en FP16, una RTX 3060 de 12 GB o superior seria suficiente en teoria, aunque no hay confirmacion del autor.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base (3B), pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: la aplicacion se ejecuta con `python app.py` tras instalar `gradio==6.31.0`, `numpy`, `scipy`, `pandas`, `matplotlib` y `pillow`; tambien en Google Colab con GPU mediante el cuaderno de demostracion del grupo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion fundamentada.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un dispositivo medico; no debe usarse para diagnostico ni decision clinica.
- Los mapas de demostracion son sinteticos; el rendimiento sobre datos reales de pacientes no esta documentado.
- El dataset de referencia, Harvard-GDP, tiene licencia CC BY-NC-ND 4.0, lo que prohibe el uso comercial y la creacion de obras derivadas.
- La licencia del repositorio de la aplicacion no esta declarada, lo que genera incertidumbre sobre su reutilizacion.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluacion cuantitativa del verificador de respuestas.
- No se especifican idiomas soportados ni longitud de contexto del modelo base.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-14) es futura respecto a la mayoria de referencias, lo que conviene verificar antes de citar el recurso.
- Dependencia de versiones muy concretas (`gradio==6.31.0`), lo que puede complicar la reproducibilidad a medio plazo.

## Enlaces

- Repositorio de la aplicacion: https://huggingface.co/BN4601A/rnfl-assistant-app
- Adaptador LoRA: https://huggingface.co/NabillahBee/rnfl-qwen2.5-vl-3b-lora
- Dataset Harvard-GDP (referenciado en la model card, sin URL directa en la informacion disponible): no disponible
