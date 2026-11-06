# robertzty/neural-motion-v2d-track3-submission

## Resumen

Neural Motion es la entrega del equipo homonimo para la Track 3 del NVIDIA Video-to-Data Challenge 2026, centrada en manipulacion diestra de extremo a extremo a partir de video egocentrico. No se trata de un modelo de lenguaje ni de un modelo fundacional al uso, sino de un contenedor de evaluacion que empaqueta una politica de control entrenada con aprendizaje por refuerzo, junto con los artefactos necesarios para reproducir la evaluacion en las seis tablas de la competicion.

El repositorio de Hugging Face funciona como punto de publicacion del contenedor de envio (formato tarball comprimido con zstd y cargado como imagen Docker). La model card indica que el contenedor se esta reconstruyendo con los identificadores de envio de Kaggle de la subida contabilizada, y que la pagina listara el tarball, su sha256 y el image id cuando este disponible. En el momento de redactar esta ficha no se ha publicado aun el artefacto final.

La relevancia es acotada: se trata de una entrega de competicion con cero descargas y cero likes, publicada el 4 de noviembre de 2026. Su interes reside en el enfoque (video egocentrico a politica de manipulacion diestra, empaquetado reproducible sobre el evaluador FlashCHORD) y en la licencia Apache-2.0 del codigo y las politicas propias, no en un uso general como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con reinforcement learning; no se detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a un modelo de politica robotica) |
| Licencia | Apache-2.0 (codigo, politicas y mallas propias); componentes de terceros conservan sus licencias |
| Formato de pesos | checkpoints de politica empaquetados en imagen Docker; tarball `.tar.zst` con `docker load`; metadatos en `/submission/submission.json` (Parquet, ids de Kaggle) |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura de la red de politica: la model card no especifica si se trata de un transformer, una CNN, un modelo diffusion policy o una combinacion. Lo que si se explicita es el paradigma de entrenamiento: aprendizaje por refuerzo (tag `reinforcement-learning`) para manipulacion diestra, con un checkpoint de politica por cada episodio puntuado (20 en total) y rollouts oficiales con `world_count=1` empaquetados en el envio.

El flujo de trabajo declarado es de extremo a extremo desde video egocentrico: el equipo reconstruye mallas a partir de los videos y entrena politicas que se evaluan contra el evaluador oficial FlashCHORD (commit `8c778f9`). El contenedor se construye sobre la imagen del evaluador sin modificar su checkout ni su venv, lo que garantiza que la evaluacion se ejecuta en el mismo entorno que el de la competicion. No se han publicado detalles sobre volumen de datos de entrenamiento, composicion del dataset, ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Control de manipulacion diestra de extremo a extremo a partir de video egocentrico.
- Politicas de control entrenadas por refuerzo, con un checkpoint por episodio puntuado.
- Reconstruccion de mallas a partir de videos (artefactos incluidos en el envio).
- Empaquetado reproducible: imagen Docker autocontenida con verificacion (`/submission/run.sh verify`).
- Ejecucion sin red (`--network none`), adecuada para entornos de evaluacion aislados.
- Integracion con el evaluador FlashCHORD y con las seis tablas de la Track 3.
- Soporte de tool calling, agentes, razonamiento multi-step, capacidades multilingues, vision o audio: no disponible (no aplica a este tipo de artefacto).

## Casos de uso

- Reproduccion de resultados de competicion: cargar el tarball con `zstd -dc ... | docker load` y ejecutar `verify` permite a un revisor reproducir la evaluacion exacta del envio en un entorno aislado sin red.
- Auditoria de envios en challenges de robotica: el fichero `/submission/submission.json` documenta los Parquet subidos, los ids de Kaggle en cada una de las seis tablas y el evaluador empleado, lo que facilita la trazabilidad por parte del comite organizador.
- Investigacion en manipulacion diestra desde video: los checkpoints de politica por episodio y las mallas reconstruidas sirven como material de referencia para comparar estrategias de aprendizaje por refuerzo en tareas de destreza.
- Reutilizacion del pipeline de evaluacion: al construirse sobre la imagen oficial de FlashCHORD sin alterar su checkout ni su venv, el contenedor puede servir de plantilla para otros equipos que necesiten empaquetar sus propios envios en la misma infraestructura.
- Docencia y divulgacion: el ejemplo de contenedor reproducible con verificacion offline es un caso practico de buenas practicas de empaquetado para evaluacion cientifica.
- Base para experimentos propios: dado que el codigo y las politicas son Apache-2.0, un grupo puede partir de estos artefactos para extender el entrenamiento por refuerzo a nuevas tareas de manipulacion, siempre que respete las licencias de los componentes de terceros incluidos en la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Docker con carga de imagen desde tarball zstd (`zstd -dc neural-motion-v2d-track3-submission.tar.zst | docker load`); ejecucion con `docker run --rm --network none IMAGE /submission/run.sh verify`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otros envios o artefactos comparables de la Track 3 del NVIDIA Video-to-Data Challenge 2026, ni se dispone de datos de parametros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- El artefacto principal (tarball, sha256 e image id) no esta publicado todavia: la model card indica que el contenedor se esta reconstruyendo con los ids de Kaggle de la subida contabilizada.
- No se especifica la arquitectura de la red de politica, el numero de parametros ni los datos de entrenamiento, lo que impide evaluar su calidad tecnica de forma independiente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- El ambito de aplicacion es muy especifico (manipulacion diestra en un challenge concreto); no es un modelo de proposito general ni sustituye a un modelo de lenguaje o vision de uso comun.
- La licencia Apache-2.0 cubre solo el codigo, las politicas y las mallas propias; los componentes de terceros de la imagen (evaluador FlashCHORD, kit de envio, paquetes de Python) conservan sus propias licencias y deben revisarse antes de un uso comercial.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma porque no aplican al tipo de artefacto; cualquier uso en produccion requeriria una evaluacion propia de robustez de la politica.
- El envio esta disenado para ejecutarse sin red; cualquier extension que requiera acceso a red queda fuera del entorno previsto por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/robertzty/neural-motion-v2d-track3-submission
- Evaluador FlashCHORD (referenciado en la model card, commit `8c778f9`): no disponible como enlace directo en la informacion proporcionada
- NVIDIA Video-to-Data Challenge 2026 (pagina oficial): no disponible en la informacion proporcionada
