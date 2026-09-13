# monomyth/fly-brain-grok

## Resumen

fly-brain-grok es un artefacto de conectomica computacional publicado por el usuario monomyth en HuggingFace, no un checkpoint de Transformers ni un modelo de lenguaje. Consiste en una destilacion de ganancias sinapticas (`g`) por clase, correspondientes a un recorte del conectoma MaleCNS con neuronas de tipo LIF (leaky integrate-and-fire), junto con un descompresor `U` de 12 parametros que mapea neuronas descendentes (DN) a comandos TCP para el brazo cinematico ReBot B601-DM. El repositorio se distribuye con `library_name: numpy` y se carga mediante `numpy.load`, no con `transformers`.

El problema que aborda es el control motor de bajo nivel a partir de circuitos biologicos: en lugar de entrenar una politica desde cero, se extraen ganancias sinapticas destiladas del conectoma del sistema nervioso central de la mosca macho (MaleCNS / MANC, procedente del conectoma publico del Janelia male CNS) y se empaquetan en un formato ligero de vectores NumPy. El recorte de referencia contiene 59.740 neuronas y 267 neuronas descendentes puntuadas, segun el fichero `hop-probe.json`.

Su relevancia es acotada y experimental: sirve como material de reproducibilidad para el proyecto monomyth/rebot-motion-lab (rama `fly-brain-grok`) y como punto de partida para quien quiera inspeccionar la destilacion de ganancias LIF sin tener que reconstruir el grafo completo. No soporta idiomas, generacion de texto ni ninguna tarea de NLP; el pipeline declarado en HuggingFace es `robotics`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de conectomica: destilacion de ganancias sinapticas LIF por clase sobre un recorte de MaleCNS, mas un descompresor DN→TCP de 12 parametros (`U`). No es un transformer ni una red neuronal convencional entrenada de extremo a extremo |
| Parametros totales | no disponible (no se declara un recuento de parametros; el contenido son vectores `g` y `u` almacenados en `.npz` y `.json`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en precision nativa de NumPy, sin formatos cuantizados declarados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`g-distill.npz`, `malecns-v1.0-crop-v1-optic-rich-mancType-DNfl-DNxl.npz`) y JSON (`g-distill.json`, `hop-probe.json`, `eval-size20.json`) |

## Arquitectura y entrenamiento

El artefacto no sigue la arquitectura de un transformer. Se compone de dos piezas: por un lado, un vector `g` de ganancias sinapticas por clase obtenido mediante destilacion sobre un recorte del conectoma MaleCNS; por otro, un vector `u` que contiene los parametros del descompresor DN→TCP, incluido el parametro `w_contact` en la ultima posicion. El descompresor tiene 12 parametros declarados. La carga se realiza con `numpy.load("g-distill.npz")` y el resultado se pasa al script `controller/scripts/run_dn_bus.py --gains ...` del proyecto anfitrion.

La procedencia declarada por el autor es el conectoma publico del sistema nervioso central de la mosca macho de Janelia, con tipos MaleCNS / MANC. La model card indica explicitamente que los profesores (*teachers*) de tipo overlay y k-NN no se almacenan en este repositorio, y que `da_learned` es falso. El fichero `g-distill.json` incluye un hash de integridad `g_hash` con valor `7bca9074a252951b`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que no se trata de un modelo de lenguaje y el proceso de destilacion no se detalla en la model card.

## Capacidades

- Aporta ganancias sinapticas destiladas (`g`) por clase para un recorte de conectoma MaleCNS con neuronas LIF.
- Proporciona un descompresor DN→TCP (`U`, 12 parametros, incluido `w_contact`) orientado al brazo cinematico ReBot B601-DM.
- Incluye un recorte CSR opcional (optico + DN) para evitar tener que reconstruir el grafo completo en el pipeline de preparacion.
- Permite verificar la identidad del recorte mediante `hop-probe.json`, que declara 59.740 neuronas y 267 DNs puntuadas.
- Permite reproducir la ultima evaluacion de episodios en vivo mediante `eval-size20.json` (resumen de los ultimos 20 mm de episodio).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- No tiene capacidades multilingues; el campo de idiomas no esta disponible.
- No incorpora modo de pensamiento (*thinking*) ni decodificacion especulativa.

## Casos de uso

- Reproduccion de experimentos de conectomica: cargar `g-distill.npz` para comparar las ganancias destiladas con las de una reconstruccion alternativa del recorte MaleCNS, usando `g_hash` como referencia de integridad.
- Control del brazo ReBot B601-DM en laboratorio: pasar el fichero de ganancias a `controller/scripts/run_dn_bus.py --gains ...` para ejecutar la politica de control derivada de las DNs sobre la cinematica del brazo.
- Inspeccion de circuitos descendentes: usar `hop-probe.json` para auditar la identidad del recorte (59.740 neuronas, 267 DNs puntuadas) antes de lanzar simulaciones.
- Aceleracion del pipeline de preparacion: emplear el `.npz` CSR optico + DN (`malecns-v1.0-crop-v1-optic-rich-mancType-DNfl-DNxl.npz`) para saltarse la construccion del grafo completo cuando solo se necesita ese subconjunto.
- Evaluacion de episodios de agarre (*hold*): analizar `eval-size20.json` para revisar el resumen de los ultimos 20 mm de episodio en vivo y contrastar el comportamiento del controlador.
- Transferencia a otros efectores: sustituir la capa `U` manteniendo las ganancias `g` destiladas, como punto de partida para adaptar la senal DN a otra cinematica, siempre que se valide experimentalmente.
- Docencia o divulgacion en neurociencia computacional: usar el paquete como ejemplo minimo de destilacion de ganancias LIF frente a simulaciones completas del conectoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico artefacto de evaluacion es `eval-size20.json`, descrito como resumen de los ultimos 20 mm de episodio en vivo, pero no se proporcionan cifras de exito, error de seguimiento ni comparaciones cuantitativas.

## Requisitos de hardware

- El tamano del repositorio en HuggingFace se declara como 0.0 GB, por lo que los ficheros de ganancias y parametros son de tamano reducido; no se especifica el peso exacto en MB.
- VRAM estimada: no aplica en sentido estricto, ya que la carga se hace con NumPy en CPU; no se declara uso de GPU.
- GPU recomendadas: no disponible. No se menciona CUDA, ROCm ni ningun backend acelerado en la model card.
- Cabe en cualquier equipo de consumo: al ser un artefacto NumPy, basta con un entorno Python capaz de cargar `.npz` y `.json`.
- Opciones de despliegue: `numpy.load` en Python y el script del proyecto anfitrion `controller/scripts/run_dn_bus.py`. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por episodio ni frecuencia de control.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio resultados tecnicos relacionados (unicamente enlaces a Instagram), y en la informacion proporcionada no se citan modelos alternativos de la misma categoria con los que comparar parametros, contexto, licencia o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un checkpoint de Transformers: cargarlo con `transformers` fallara; debe usarse `numpy.load`.
- `da_learned` es falso segun la model card, por lo que no debe presentarse como una politica aprendida de extremo a extremo.
- Los profesores de tipo overlay y k-NN no se almacenan en el repositorio, de modo que la destilacion no es completamente reproducible solo con estos ficheros.
- El artefacto esta especializado en el brazo ReBot B601-DM; su validez fuera de esa cinematica no esta documentada.
- La model card advierte de que, tras un *hold* exitoso, el cliente actual se pliega (*Folds*) sin abrir, por lo que el cubo no se libera. Es un caveat operativo relevante en produccion.
- No hay benchmarks publicados, 0 descargas y 0 likes en el momento de la consulta, lo que limita cualquier afirmacion sobre robustez o generalizacion.
- La licencia del repositorio es MIT, pero la procedencia (conectoma MaleCNS / MANC de Janelia) puede estar sujeta a terminos adicionales que no se detallan en la informacion disponible; conviene verificar las condiciones del dataset original antes de un uso comercial.
- No se declaran idiomas, sesgos ni riesgos de alucinacion aplicables, porque el artefacto no genera texto.
- Riesgo de desalineacion entre el hash de integridad y futuras revisiones: `g_hash` es `7bca9074a252951b` para esta version concreta; cualquier modificacion del `.npz` invalidaria la correspondencia.

## Enlaces

- HuggingFace: https://huggingface.co/monomyth/fly-brain-grok
- Repositorio de codigo: https://github.com/monomyth/fly-brain-grok
- Rama del proyecto anfitrion: https://github.com/monomyth/rebot-motion-lab/tree/fly-brain-grok
- Conectoma de procedencia (MaleCNS / MANC, Janelia male CNS): mencionado en la model card, sin URL proporcionada en la informacion disponible.
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos corresponden a Instagram y no guardan relacion con el modelo.
