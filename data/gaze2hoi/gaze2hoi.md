# gaze2hoi/Gaze2HOI

## Resumen

Gaze2HOI es un paquete de pesos de inferencia para el trabajo de investigación "Gaze2HOI: Gaze-Aware Intention Disambiguation for Egocentric Hand-Object Interaction Forecasting", firmado por Chuanyang Ma, Chenye Wang, Yixuan Wang, Huiling Zhou, Xingqun Qi, Muyi Sun, Man Zhang, Caifeng Shan y Zhenan Sun (2026, manuscrito de investigación). No es un modelo de lenguaje al uso, sino un pipeline multimodal que predice intenciones estructuradas a partir de observaciones RGB y de la mirada del usuario, ancla esas intenciones en la geometría de contacto y genera movimiento acoplado de mano y objeto mediante difusión.

El sistema se apoya en el VLM Qwen/Qwen3-VL-8B-Instruct como motor de razonamiento visual, sobre el que se monta un adaptador LoRA junto con un módulo propietario de modulación de mirada (TGSM). A este componente se suman un modelo de campos anticipatorios de contacto, soporte y colocación (`acg.pt`) y un modelo de difusión EMA para la generación de movimiento (`motion.pt`). El repositorio publicado (0,4 GB) contiene únicamente tensores de inferencia y ajustes de arquitectura: no incluye pesos del modelo base, estados de optimizador, registros de entrenamiento ni ficheros MANO.

Su relevancia es acotada pero clara para el nicho de visión egocéntrica: aborda la ambigüedad de intención (qué objeto, con qué propósito, con qué mano y en qué parte se va a contactar) usando la mirada como señal de desambiguación, un problema poco cubierto por los VLM genéricos. Es importante subrayar que no es un sistema de reconstrucción a partir de vídeo crudo: requiere estados 3D observados de mano y objeto, además de geometría de la escena, y MANO obtenido por separado bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal: VLM (Qwen3-VL-8B-Instruct) + adaptador LoRA con modulo TGSM de modulacion de mirada + modelo de campos de contacto anticipatorio (acg.pt) + difusion EMA para movimiento (motion.pt) |
| Parametros totales | No disponible (el modelo base aporta 8B; no se publica el recuento de los modulos de contacto y difusion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-8B-Instruct, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Pesos en BF16 (`safetensors` para el adaptador, state dicts PyTorch para `acg.pt` y `motion.pt`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `gaze2hoi-component-licenses` (licencia propia por componentes, ver `LICENSE.md` y `NOTICE.md`); MANO y pesos del modelo base sujetos a sus propios terminos |
| Formato de pesos | `safetensors` (`intention/adapter_model.safetensors`), PyTorch state dict plano cargado con `weights_only=True` (`acg.pt`, `motion.pt`), activos fijos en `assets/` y manifiesto `manifest.json` con tamanos y SHA-256 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en tres etapas. La primera es un adaptador LoRA sobre Qwen3-VL-8B-Instruct que incluye un modulo custom de modulacion de mirada (TGSM) y produce intenciones estructuradas a partir de RGB y mirada; el adaptador debe cargarse a traves de la implementacion liberada de Gaze2HOI, no como un adaptador PEFT estandar, precisamente por ese modulo adicional. La segunda etapa ancla la intencion en geometria de contacto mediante `acg.pt`, que implementa campos online de contacto anticipatorio, soporte y colocacion. La tercera etapa genera movimiento acoplado mano-objeto con un modelo de difusion con media movil exponencial (EMA) de pesos, distribuido como `motion.pt` junto con los buffers necesarios.

En inferencia, el VLM usa decodificacion voraz restringida (constrained greedy decoding), mientras que la difusion emplea por defecto 50 pasos DDIM, escala de guia 1,5, eta 0 y semilla base 999; los numeros de sorteo y perfiles de ruido por ejemplo se guardan en el paquete de ejemplos. El pipeline se ejecuta de forma escalonada: la inferencia de contacto y movimiento corre despues de liberar el VLM de la memoria de la GPU, y se admite colocacion multi-GPU. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Los pesos publicados omiten estados de optimizador, copias duplicadas de parametros y registros de entrenamiento.

## Capacidades

- Prediccion de intenciones estructuradas (proposito, parte de contacto, mano activa) en escenarios egocentricos, a partir de RGB y senal de mirada.
- Desambiguacion de intencion guiada por mirada, que es la aportacion central frente a un VLM que solo ve la imagen.
- Anclaje de la intencion en geometria de contacto: campos de contacto anticipatorio, soporte y colocacion.
- Generacion de movimiento acoplado de mano y objeto mediante difusion, con control de semilla y de pasos de muestreo.
- Serializacion de resultados y renderizado a traves de los subcomandos `intention`, `forecast` y `render`.
- Verificacion de integridad del paquete mediante `manifest.json` y el subcomando `check --hashes`.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling, function calling, modo thinking, audio o video en streaming: no disponibles como capacidades documentadas de este paquete.
- No soporta reconstruccion a partir de video crudo: exige estados 3D observados de mano y objeto y geometria de escena como entradas adicionales.

## Casos de uso

- Investigacion en anticipacion de intenciones en vision egocentrica: reproduccion de los ejemplos del benchmark EgoAIM con semillas fijas y comparacion contra las referencias publicadas, usando `gaze2hoi check --samples all --hashes` para validar el entorno antes de medir.
- Analisis de errores de desambiguacion: el paquete incluye ejemplos de fallo en los que el modelo confunde proposito, parte de contacto o mano activa, lo que permite estudiar sistematicamente esos modos de fallo sin necesidad de generar nuevos datos.
- Generacion de datos sinteticos de interaccion mano-objeto: el modulo de difusion puede producir trayectorias acopladas plausibles para aumentar datasets de HOI, siempre que se disponga de estados 3D y geometria de escena previos.
- Evaluacion de destreza en entornos industriales o de ensamblaje: con reconstruccion 3D previa del operario y de la pieza, el sistema puede anticipar que parte del objeto se va a manipular y con que mano, lo que sirve para analisis offline de procedimientos.
- Investigacion en interfaces AR y gafas inteligentes: uso de la mirada como senal para clasificar entre hipotesis de intencion competidoras antes de que se produzca el contacto fisico.
- Base para experimentos de adaptacion: el adaptador LoRA sobre Qwen3-VL-8B-Instruct puede servir como punto de partida para estudiar variantes del modulo de mirada, aunque requiere la implementacion liberada para cargarse.
- Auditoria y reproduccion de resultados: el flujo documentado (descarga, `check`, `intention`, `forecast`, `render`) permite reconstruir los 11 ejemplos publicados y comprobar la coincidencia de intenciones y la desviacion de trayectoria.
- Docencia y divulgacion: los ejemplos cualitativos y de fallo, junto con el renderizado, sirven para ilustrar como la mirada reduce la ambiguedad en la prediccion de intenciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el benchmark EgoAIM y advierte de que los ejemplos incluidos no lo constituyen en su totalidad, pero no aporta cifras (MMLU, HumanEval, GSM8K ni metricas especificas de HOI).

Los unicos datos cuantitativos publicados son de verificacion de reproducibilidad, no de rendimiento:

| Comprobacion | Resultado declarado |
|---|---|
| Ejemplos regenerados | 11 |
| Coincidencia de intenciones estructuradas con las referencias | Coincidentes en los 11 ejemplos |
| Diferencia maxima de traslacion de trayectoria | Inferior a 1,20 x 10^-7 m en el entorno verificado |
| Muestreo de difusion | 50 pasos DDIM, guidance scale 1,5, eta 0, semilla base 999 |
| Decodificacion del VLM | Voraz restringida |

El autor advierte de que la reproducibilidad con semillas fijas depende de hardware, precision, versiones de software y flujos de ruido ligados al dispositivo.

## Requisitos de hardware

- VLM base: los pesos BF16 de Qwen3-VL-8B-Instruct ocupan aproximadamente 16,3 GiB, excluyendo sobrecarga de runtime. Se necesita una GPU con al menos 24 GB para cargarlo comodamente en BF16 (RTX 4090, A10G de 24 GB van muy justas al sumar activaciones y cache); A100 de 40 u 80 GB y H100 son las opciones holgadas.
- Modulos Gaze2HOI: el repositorio completo ocupa 0,4 GB, por lo que el adaptador LoRA, `acg.pt`, `motion.pt` y `assets/` caben en cualquier GPU moderna junto al VLM si se escalona la ejecucion.
- Estrategia de memoria: la inferencia de contacto y movimiento se ejecuta despues de liberar el VLM de la memoria del dispositivo, y se admite colocacion multi-GPU; esto permite ajustar el pico de VRAM por etapas en lugar de mantener todo residente.
- Cabe en GPU de consumo: si, para la etapa VLM en BF16 en tarjetas de 24 GB, aunque el autor no confirma explicitamente que el pipeline completo entre en una sola GPU de consumo. No se publican pesos cuantizados que reduzcan el requisito por debajo de esos 16,3 GiB.
- Dependencia adicional: ficheros del modelo MANO, obtenidos por separado bajo su propia licencia, necesarios para `check`, `forecast` y `render` (parametro `--mano-dir`).
- Opciones de despliegue: no se soportan vLLM, TGI, llama.cpp ni Ollama para este paquete; el unico camino documentado es la CLI e implementacion de Gaze2HOI (`gaze2hoi download`, `check`, `intention`, `forecast`, `render`), con el modelo base y el procesador cargados aparte desde `Qwen/Qwen3-VL-8B-Instruct`, admitiendo `--base-model` y `--local-files-only`.
- Latencia y throughput: no disponibles. Como referencia de coste, cada muestra de movimiento implica 50 pasos DDIM, y el pipeline encadena una pasada de VLM con decodificacion voraz restringida mas la inferencia de contacto y difusion.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de Gaze2HOI ni de modelos comparables de pronostico de interaccion mano-objeto con los que contrastarlo, por lo que la comparacion numerica no esta disponible. La unica comparacion documentable es con su propio modelo base, que resuelve una tarea distinta:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gaze2HOI | 8B en el VLM base + modulos no cuantificados | No disponible | Intencion estructurada + contacto + movimiento mano-objeto con mirada | `gaze2hoi-component-licenses` (por componentes) | Pesos de inferencia en HuggingFace (0,4 GB) + codigo en GitHub |
| Qwen/Qwen3-VL-8B-Instruct | 8B | No disponible en la informacion proporcionada | VLM generalista de imagen y texto | La del modelo base (consultar su card) | Publico en HuggingFace |
| Otros modelos de HOI forecasting | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia funcional clave frente al modelo base es que Gaze2HOI anade la senal de mirada, el anclaje geometrico de contacto y la generacion de movimiento, a cambio de exigir entradas 3D y geometria de escena que el VLM por si solo no necesita.

## Limitaciones y advertencias

- No es un sistema de reconstruccion a partir de video crudo: requiere estados 3D observados de mano y objeto y geometria de escena. Usarlo con solo RGB no es el caso de uso previsto.
- El adaptador incorpora un modulo de mirada personalizado y no puede cargarse como un adaptador PEFT convencional; hay que usar la implementacion liberada de Gaze2HOI.
- Confusiones documentadas: los pronosticos pueden equivocar el proposito, la parte de contacto o la mano activa, tal como se ilustra con los casos de fallo del proyecto.
- Los 11 ejemplos publicados incluyen fallos y no constituyen el benchmark EgoAIM completo; no deben tomarse como medida de rendimiento global.
- Las salidas se generan sin suavizado temporal ni refinamiento de movimiento, lo que puede producir trayectorias menos naturales que en una version postprocesada.
- Licencia poco habitual: `gaze2hoi-component-licenses` con terminos por componente en `LICENSE.md` y atribuciones en `NOTICE.md`. Es imprescindible revisarla antes de cualquier uso comercial; la licencia del codigo no sustituye los terminos de datos o modelos de terceros.
- MANO se distribuye por separado bajo su propia licencia y no esta incluido en el repositorio.
- Los pesos del modelo base Qwen3-VL-8B-Instruct no se incluyen y quedan sujetos a su propia licencia.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado, incluido el castellano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al apoyarse en un VLM con decodificacion voraz restringida, la salida estructurada puede ser plausible pero incorrecta.
- Sesgos: no documentados en la informacion proporcionada.
- Integridad del paquete: `manifest.json` fija tamanos y SHA-256; modificar los ficheros sin regenerar el manifiesto invalida la verificacion.
- Reproducibilidad condicionada: el acuerdo numerico depende de hardware, precision, versiones de software y flujos de ruido del dispositivo, aunque se fijen las semillas.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en octubre de 2026, asociado a un manuscrito de investigacion; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gaze2hoi/Gaze2HOI
- Pagina del proyecto: https://gaze2hoi.github.io/
- Codigo e instrucciones de instalacion: https://github.com/gaze2hoi/Gaze2HOI
- Datos de ejemplo (EgoAIM-Demo): https://huggingface.co/datasets/gaze2hoi/EgoAIM-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Licencia por componentes: https://huggingface.co/gaze2hoi/Gaze2HOI/blob/main/LICENSE.md
- Atribuciones de terceros: https://huggingface.co/gaze2hoi/Gaze2HOI/blob/main/NOTICE.md
- Manifiesto de integridad: https://huggingface.co/gaze2hoi/Gaze2HOI/blob/main/manifest.json

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a cuentas de redes sociales sin vinculacion con el proyecto), por lo que no se incluyen como enlaces relevantes.
