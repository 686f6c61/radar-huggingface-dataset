# indahl/indahl-number-check

## Resumen

`indahl-number-check` es un plugin para Claude Code desarrollado por Heuremen LLC (publicado en Hugging Face bajo el usuario `indahl`) que automatiza la verificacion de cifras en documentos. Su funcion es recorrer cada numero de un informe, memo, presentacion o cuadro de mando y contrastarlo con la fuente de datos indicada por el usuario, marcando cada cifra con uno de cuatro estados: HELD (coincide con la fuente), MOVED (la cifra ha cambiado respecto a la fuente), NO_SOURCE (no se encuentra respaldo) o CANNOT_TELL (no es posible determinarlo).

No se trata de un modelo de lenguaje con pesos publicados, sino de un artefacto de tipo plugin/skill que se ejecuta dentro de una sesion de Claude Code. Por ello no hay arquitectura de red neuronal, parametros, ventana de contexto ni cuantizaciones que reportar: el "motor" es el propio modelo de Claude Code sobre el que se instala el plugin. Esta distincion es importante para quien llegue buscando un modelo desplegable.

Su relevancia es practica: responde a un problema recurrente en flujos de trabajo con LLM, la propagacion de cifras sin verificar en documentos generados o asistidos por IA. Se instala via el marketplace de plugins de Claude Code y esta pensado para ejecutarse despues de cualquier skill de investigacion, finanzas, analitica o reporting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code; no es un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Claude Code subyacente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (plugin distribuido via marketplace de Claude Code) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado sino un plugin que define un comando (`/number-check`) y un flujo de verificacion dentro de Claude Code. El autor no documenta arquitectura interna, datos de entrenamiento, proceso de RLHF/DPO ni innovaciones tecnicas de modelado; la model card se limita a describir el comportamiento funcional (marcado de cifras y trazabilidad a la linea de fuente).

El funcionamiento declarado consiste en abrir unicamente las fuentes que el usuario indica (por ejemplo, hojas de calculo en `data/`) y contrastar cada figura del documento objetivo con ellas. No contacta servicios externos: se ejecuta dentro de la sesion del usuario. La logica de marcado (HELD, MOVED, NO_SOURCE, CANNOT_TELL) es la unica "innovacion" descrita y es de naturaleza procedimental, no de aprendizaje automatico.

## Capacidades

- Verificacion de cifras: genera una fila por cada numero presente en el documento analizado.
- Clasificacion en cuatro estados: HELD, MOVED, NO_SOURCE y CANNOT_TELL.
- Trazabilidad: muestra la linea de fuente junto a cada cifra evaluada.
- Integracion como comando de Claude Code (`/number-check` seguido de la instruccion de verificacion).
- Encadenamiento con otros skills: pensado para ejecutarse despues de skills de investigacion, finanzas, analitica o reporting.
- Ejecucion local en la sesion: no contacta servicios externos ni abre fuentes distintas de las indicadas.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling generico, agentes multi-paso ni multilingues propias del artefacto.

## Casos de uso

- Verificacion de informes trimestrales: ejecutar `/number-check Q3-summary.md against the spreadsheets in data/` para contrastar cada cifra del resumen con las hojas de calculo de origen antes de su distribucion.
- Auditoria de memos financieros: marcar como MOVED o NO_SOURCE las cifras que no coinciden con el libro de calculo, con la linea fuente al lado para revision manual.
- Control de calidad de presentaciones (decks): revisar que los numeros de las diapositivas coinciden con el dataset o dashboard de referencia antes de enviarlas a direccion.
- Validacion de cuadros de mando: comprobar que las metricas publicadas en un dashboard tienen respaldo en la fuente de datos subyacente.
- Cierre de pipelines de reporting asistidos por IA: usarlo como paso final tras un skill de analitica para evitar que cifras generadas sin respaldo lleguen al documento final.
- Revision previa al envio de cualquier documento con numeros: puerta de calidad obligatoria antes de remitir informes a clientes, inversores o equipos.
- Trazabilidad documental: conservar la tabla de marcas y lineas de fuente como evidencia de auditoria del proceso de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el plugin no incluye pesos ni se ejecuta como modelo local independiente.
- GPU recomendadas: no aplica; el computo lo realiza el modelo Claude Code subyacente en la infraestructura del proveedor.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: Claude Code con el marketplace de plugins (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-number-check@heuremen`).
- Latencia y throughput: no disponibles; dependen del modelo Claude Code y del volumen de cifras y fuentes a contrastar.
- Requisitos declarados por el autor: ninguno.

## Comparativa con modelos similares

| Producto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indahl-number-check | Plugin de verificacion para Claude Code | no aplica | no disponible | no disponible | Hugging Face y marketplace de Claude Code |
| Alternativas de verificacion de cifras | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre productos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generacion de texto, codigo ni tareas generales de inferencia.
- Depende por completo de Claude Code; sin esa herramienta no es utilizable.
- La calidad de la verificacion depende de las fuentes que el usuario indique; si la fuente es incompleta o incorrecta, las marcas heredan ese error.
- La categoria CANNOT_TELL reconoce explicitamente casos no determinables, pero no se documenta la tasa de falsos HELD o falsos NO_SOURCE.
- La licencia no esta declarada en la informacion disponible; debe consultarse antes de cualquier uso comercial.
- El autor remite a terminos y politica de privacidad externos (indahl.ai/terms y indahl.ai/privacy) que no se detallan en la model card.
- Sin descargas ni likes registrados en el momento de la consulta; madurez y adopcion no verificables.
- No se documentan sesgos, comportamiento multilingue ni rendimiento medido.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-number-check
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/number-check
