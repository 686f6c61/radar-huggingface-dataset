# Esimuda/linguard-caa-vectors

## Resumen

Linguard CAA steering vectors for Tiny Aya Earth es un artefacto de seguridad publicado por el usuario Esimuda en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de vectores de direccionamiento (steering vectors) extraidos mediante la tecnica CAA (Contrastive Activation Addition) sobre el modelo base CohereLabs/tiny-aya-earth. El objetivo es endurecer el comportamiento del modelo en tiempo de inferencia frente a respuestas inseguras, sin modificar los pesos originales.

El paquete se genero con la funcion `extract_caa_vectors` de la libreria SafeTune, tomando activaciones de las capas 12, 16 y 20 a partir de un conjunto de calibracion reservado (`Esimuda/linguard-safety/calibration`). La aplicacion practica consiste en cargar los vectores con `torch.load` y envolver el modelo con `safetune.steer.CAAModel`, aplicando una intensidad de 0,25. Al ser un artefacto derivado, su utilidad depende enteramente del modelo base sobre el que se aplica.

La relevancia de esta publicacion es limitada pero concreta: ofrece un mecanismo de alineamiento ligero y reversible para un modelo pequeno multilingue (Tiny Aya Earth), pensado para despliegues donde no es viable reentrenar. El repositorio no incluye pesos del modelo, dataset de evaluacion ni resultados numericos publicados en la model card, por lo que la mayor parte de las especificaciones tecnicas habituales no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccionamiento (CAA) sobre un transformer; no es un modelo autonomo |
| Parametros totales | no disponible (el artefacto no contiene pesos del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base CohereLabs/tiny-aya-earth) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se detalla cobertura) |
| Licencia | MIT |
| Formato de pesos | `caa_vectors.pt` (tensor PyTorch cargado con `torch.load`) |

## Arquitectura y entrenamiento

El artefacto no define una arquitectura propia: son vectores de direccion calculados a partir de diferencias de activaciones entre pares de prompts (contrastivos) en las capas 12, 16 y 20 del modelo base CohereLabs/tiny-aya-earth. La tecnica CAA (Contrastive Activation Addition) consiste en promediar la diferencia de activaciones entre respuestas seguras e inseguras y sumar ese vector, escalado por un coeficiente, a las activaciones durante la inferencia. El resultado es un control de comportamiento en tiempo de ejecucion sin tocar los pesos.

El proceso de extraccion se realizo con `extract_caa_vectors` de SafeTune sobre el conjunto de calibracion `Esimuda/linguard-safety/calibration`. No se especifican en la model card el numero de pares contrastivos, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplica, al no entrenarse pesos). La innovacion tecnica es la aplicacion de steering a un modelo pequeno multilingue con una intensidad fija de 0,25, lo que sugiere un ajuste conservador para minimizar la degradacion de capacidades.

## Capacidades

- Modificacion del comportamiento del modelo base en inferencia: incrementa la probabilidad de respuestas alineadas con seguridad segun la direccion aprendida.
- Aplicable a las capas 12, 16 y 20 del modelo CohereLabs/tiny-aya-earth, lo que permite combinaciones parciales.
- Reversible: al no modificar pesos, se puede activar o desactivar por peticion o por despliegue.
- No anade capacidades nuevas (no aporta tool calling, vision, audio ni modos de razonamiento extendido).
- Depende de la libreria SafeTune (`safetune.steer.CAAModel`) para su aplicacion; no es un formato estandar de inferencia.
- No se documentan capacidades multilingues especificas del artefacto; hereda las del modelo base.

## Casos de uso

- Endurecimiento de un chatbot desplegado con Tiny Aya Earth: aplicar los vectores con `strength=0.25` en el pipeline de inferencia para reducir respuestas toxicas o inseguras sin reentrenar el modelo.
- Filtrado previo en entornos de bajo recursos: al ser un modelo pequeno con steering ligero, se puede ejecutar en CPU o GPU modesta como primera capa de moderacion antes de un modelo mayor.
- Experimentacion en investigacion de seguridad: comparar el comportamiento del modelo base con y sin vectores para estudiar el efecto del steering en capas intermedias (12, 16, 20).
- Despliegues con requisitos de auditabilidad: al ser un cambio reversible y con licencia MIT, permite documentar y revertir facilmente el mecanismo de seguridad aplicado.
- Ajuste por capas en produccion: activar solo las capas 16 y 20 si la capa 12 degrada demasiado las respuestas, segun pruebas internas del equipo.
- Prototipado rapido de politicas de seguridad: variar la intensidad (por ejemplo, 0,1 frente a 0,25) para calibrar el equilibrio entre utilidad y seguridad antes de fijar una politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a metricas externas en `https://github.com/Esimuda/pidginguard`, pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el artefacto; depende del modelo base CohereLabs/tiny-aya-earth (modelo pequeno, presumiblemente ejecutable en GPU consumer, pero sin datos confirmados).
- GPU recomendadas: no disponible.
- Viabilidad en GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: inferencia con PyTorch y la libreria SafeTune (`safetune.steer.CAAModel`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linguard CAA vectors (este) | Vectores de steering | no aplica | no disponible | MIT | Hugging Face, 0 descargas |
| CohereLabs/tiny-aya-earth | Modelo base transformer | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otros artefactos CAA publicos | Vectores de steering | no aplica | no aplica | variable | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El artefacto no es un modelo autonomo: sin el modelo base CohereLabs/tiny-aya-earth y la libreria SafeTune no es utilizable.
- No se publican metricas de eficacia ni de degradacion de capacidades; la intensidad 0,25 es un valor fijo sin justificacion empirica en la model card.
- Riesgo de sobre-rechazo o respuestas excesivamente conservadoras al aplicar steering, especialmente en un modelo pequeno.
- No hay informacion sobre sesgos del modelo base ni sobre como el steering los modifica.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa conocida.
- La licencia MIT cubre el artefacto, pero el uso comercial depende tambien de la licencia del modelo base, que no se detalla.
- No se especifican idiomas cubiertos; el comportamiento multilingue del steering no esta verificado.
- No hay garantias de robustez frente a ataques de jailbreak; el steering no sustituye a un sistema de moderacion completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Esimuda/linguard-caa-vectors
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-earth
- Metricas (referenciadas en la model card): https://github.com/Esimuda/pidginguard
- Conjunto de calibracion (referenciado): https://huggingface.co/Esimuda/linguard-safety/calibration
