# forkjoin-ai/edgework-app

## Resumen

Edgework no es un modelo de lenguaje, sino una tarjeta de modelo que documenta una superficie de servicio. Segun la propia model card, se trata de la "app shell" de Forkjoin.ai orientada a Cloudflare, su superficie de API, la capa de transporte en navegador y la superficie de entrega de Aeon respaldada por recibos ("proof-backed"), donde la inferencia se trata como una carga de trabajo con precio y liquidacion mediante recibos. El autor es la organizacion `forkjoin-ai` y el codigo fuente se publica en el repositorio `apps/edgework-app` de GitHub.

El repositorio no contiene pesos. Edgework actua como fachada de servicio ("fronts serving") y enruta hacia los modelos que denomina "knots" admitidos, publicados como `forkjoin-ai/rwkv7-g1l-{1.5b,2.9b,7.2b,13.3b}` (con R2 como copia de servicio). La model card indica explicitamente que la evidencia de rendimiento y admision se encuentra en las tarjetas de los modelos servidos, no en esta.

Su relevancia es limitada para quien busque un modelo que ejecutar: no hay pesos, ni pipeline declarado, ni licencia, ni idiomas. Resulta relevante, en cambio, como documentacion de una arquitectura de servicio con control de admision, aislamiento por inquilino y liquidacion por inferencia, un patron poco habitual en el ecosistema de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una superficie de servicio) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio es una model card de una capa de servicio, no un modelo entrenado. La model card describe una arquitectura de sistema con tres componentes declarados: una "app shell" orientada a Cloudflare, una superficie de API y una capa de transporte en navegador. El enrutamiento se gobierna mediante una "admission gate": un knot solo se sirve si cuenta con un recibo de admision bilateral; en caso contrario, la peticion se rechaza.

La superficie `/api/knotgraft` (ingesta de "Prismatic Refraction") devuelve bloques con forma de knotgraph, con aislamiento por inquilino aplicado en el momento de emision y limites de tasa por nivel aplicados en el worker. La liquidacion se realiza con precio y recibo por inferencia, sin una ruta de IA financiada por la plataforma. No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque no hay modelo que entrenar en esta tarjeta. Los pesos que puede enrutar pertenecen a la familia `rwkv7-g1l`, cuya arquitectura RWKV v7 se documentaria en sus propias tarjetas.

## Capacidades

- Enrutamiento de inferencia hacia los knots admitidos de la familia `rwkv7-g1l` (1.5b, 2.9b, 7.2b y 13.3b), sujeto a recibo de admision bilateral.
- Control de admision como autoridad de enrutamiento: rechazo de peticiones sin recibo valido.
- Ingesta mediante `/api/knotgraft` con salida en bloques con forma de knotgraph.
- Aislamiento por inquilino aplicado en el momento de emision de la respuesta.
- Limites de tasa por nivel aplicados en el worker.
- Liquidacion de inferencia con precio y recibo ("settlement receipts").
- Transporte en navegador como capa de acceso al servicio.
- No se declaran capacidades de generacion, razonamiento, codigo, vision, tool calling, agentes ni multilingues en esta tarjeta; corresponden a los knots servidos.

## Casos de uso

- Despliegue de una fachada de inferencia con control de admision: el servicio solo atiende peticiones acompanadas de un recibo bilateral, lo que permite auditar que modelos estan autorizados a servir en cada momento.
- Facturacion por uso de inferencia: al tratar la inferencia como carga con precio y recibo, encaja en escenarios donde cada llamada debe quedar registrada y liquidada, como plataformas con reventa de capacidad o con cargos por consumo.
- Multi-tenencia con aislamiento estricto: el aislamiento por inquilino aplicado en la emision de `/api/knotgraft` sirve para entornos donde distintas organizaciones comparten la misma superficie de servicio sin mezclar datos.
- Control de abuso mediante limites de tasa por nivel: los limites aplicados en el worker permiten segmentar el trafico por plan o nivel de cliente sin modificar la logica de inferencia.
- Integracion desde navegador: la capa de transporte en navegador permite a aplicaciones web consumir el servicio sin un backend intermedio propio.
- Enrutamiento entre tamanos de modelo: con knots de 1.5b a 13.3b, la fachada puede dirigir cargas ligeras a los modelos pequenos y cargas mas exigentes a los mayores, siempre que exista recibo de admision.
- Publicacion de superficies de servicio en Hugging Face: este repositorio sirve como punto de descubrimiento de la superficie de servicio desde la organizacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite expresamente a las tarjetas de los knots servidos (`forkjoin-ai/rwkv7-g1l-{1.5b,2.9b,7.2b,13.3b}`) para los datos de rendimiento medido y la evidencia de admision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en esta tarjeta; depende del knot enrutado (1.5b, 2.9b, 7.2b o 13.3b) y de su cuantizacion, que no se documenta aqui.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la tarjeta describe una app shell orientada a Cloudflare con worker y superficie de API; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Edgework no es un modelo de lenguaje y no se han proporcionado alternativas comparables de la misma categoria (superficies de servicio con control de admision y liquidacion). Los unicos elementos relacionados citados son los knots `forkjoin-ai/rwkv7-g1l-{1.5b,2.9b,7.2b,13.3b}`, que constituyen los modelos efectivamente servidos y cuyas caracteristicas se documentan en sus propias tarjetas.

## Limitaciones y advertencias

- No contiene pesos: no puede descargarse ni ejecutarse como modelo. Cualquier intento de uso como modelo fallara.
- Licencia no disponible: no se especifican condiciones de uso comercial, redistribucion ni modificacion. Conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: no hay informacion sobre cobertura linguistica.
- Ausencia de benchmarks propios: el rendimiento debe consultarse en las tarjetas de los knots servidos, no en esta.
- Dependencia de la "admission gate": si un knot no dispone de recibo de admision bilateral, las peticiones se rechazan, lo que puede provocar indisponibilidad no evidente desde el cliente.
- Dependencia de infraestructura Cloudflare: la app shell esta orientada a esa plataforma, lo que limita la portabilidad del despliegue.
- Modelo de coste obligatorio: no existe una ruta de IA financiada por la plataforma; todo uso pasa por precio y recibo, lo que condiciona el diseno de integraciones.
- Fechas de creacion y actualizacion del repositorio (2026-11-13) y ausencia de descargas y likes: no hay evidencia publica de adopcion ni de validacion por terceros.
- Riesgo de confusion: al publicarse como model card en Hugging Face, puede interpretarse erroneamente como un modelo desplegable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/forkjoin-ai/edgework-app
- Codigo fuente: https://github.com/forkjoin-ai/forkjoin.ai/tree/main/apps/edgework-app
- Knots servidos (referenciados en la model card): `forkjoin-ai/rwkv7-g1l-1.5b`, `forkjoin-ai/rwkv7-g1l-2.9b`, `forkjoin-ai/rwkv7-g1l-7.2b`, `forkjoin-ai/rwkv7-g1l-13.3b` (rutas de Hugging Face bajo la misma organizacion; no se proporcionan URL completas en la informacion disponible)
- Papers, blogs y demos: no disponible
