# indahl/indahl-outside-ruler

## Resumen

`indahl/indahl-outside-ruler` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador de Heuremen LLC. Su funcion es ejecutar una pasada de arbitraje ("referee pass") sobre el material en bruto de un trabajo propio antes de publicarlo, aplicando diez comprobaciones derivadas de errores que han requerido correcciones reales en produccion. El resultado es un veredicto en uno de tres estados: STANDS (se mantiene), MOVES (con los cambios exactos a aplicar) o HOLD (se detiene).

El plugin se invoca mediante el comando `/outside-ruler` seguido del material a revisar, por ejemplo las notas de version de un release y los resultados en bruto que las respaldan. No contacta servicios externos ni requiere dependencias: se ejecuta integramente dentro de la sesion de Claude Code del usuario. Esta orientado a la verificacion previa a la publicacion de cifras, releases o afirmaciones que terceros vayan a usar para tomar decisiones.

La ficha tecnica se limita a documentar el artefacto tal como aparece en Hugging Face. No hay informacion sobre arquitectura de red neuronal, parametros, contexto ni datos de entrenamiento porque el repositorio no contiene pesos ni una model card de un modelo generativo. Cualquier dato de ese tipo se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code, no es un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del contexto de la sesion de Claude Code) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene el plugin, no pesos) |

## Arquitectura y entrenamiento

El artefacto es un plugin de Claude Code distribuido como espejo del repositorio GitHub `Heuremen-LLC/indahl-outside-ruler` en el commit `117cdf6`. No contiene un transformer, un MoE ni un SSM: es codigo de orquestacion que se ejecuta dentro de la sesion del usuario y aplica un conjunto fijo de diez comprobaciones sobre el material aportado. La logica interna del plugin no esta documentada en la model card mas alla de la descripcion funcional (pasada de arbitraje, diez comprobaciones, veredicto STANDS/MOVES/HOLD).

No se dispone de informacion sobre datos de entrenamiento, tokens procesados, composicion del dataset ni tecnicas de alineacion (RLHF, DPO). El plugin no contacta servicios externos y no requiere dependencias adicionales, segun la propia model card. La instalacion se realiza anadiendo el marketplace `Heuremen-LLC/indahl.ai` y ejecutando `/plugin install indahl-outside-ruler@heuremen`.

## Capacidades

- Revision de material en bruto antes de publicacion, con una pasada de arbitraje independiente del trabajo original.
- Aplicacion de diez comprobaciones predefinidas derivadas de errores reales que han requerido correcciones.
- Emision de un veredicto estructurado: STANDS, MOVES (con los cambios exactos) o HOLD.
- Invocacion mediante el comando `/outside-ruler` seguido del material a revisar.
- Ejecucion local dentro de la sesion de Claude Code, sin llamadas a servicios externos.
- Sin dependencias adicionales ni requisitos de instalacion mas alla del propio plugin.
- Orientado a la verificacion de cifras, notas de release y afirmaciones con consecuencias practicas para terceros.

## Casos de uso

- Verificacion de notas de release: antes de publicar las notas de una version, el plugin contrasta las afirmaciones con los resultados en bruto y devuelve MOVES con los cambios exactos si detecta discrepancias.
- Validacion de cifras antes de publicarlas: para informes, dashboards o comunicaciones externas, la pasada de arbitraje comprueba que los numeros se sostienen sobre el material original y no sobre resumenes derivados.
- Revision de afirmaciones enviadas a terceros: cuando un cliente, socio o responsable va a actuar sobre una afirmacion, el plugin aplica las diez comprobaciones y emite STANDS o HOLD antes del envio.
- Control de calidad en pipelines editoriales: integrado en el flujo de publicacion de un equipo, actua como paso previo obligatorio sobre el borrador y el material de respaldo.
- Auditoria de documentacion tecnica: revision de guias y especificaciones frente a los datos y resultados que las respaldan, con veredicto explicito sobre cada cambio necesario.
- Verificacion de resultados experimentales: antes de compartir metricas de un experimento o benchmark interno, el plugin contrasta que las cifras publicadas coinciden con el material en bruto disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo generativo y la model card no incluye metricas de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el plugin se ejecuta dentro de Claude Code y no carga pesos localmente.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: Claude Code, previa instalacion del plugin desde el marketplace `Heuremen-LLC/indahl.ai`.
- Latencia y throughput: no disponibles; dependen del modelo subyacente de Claude Code y de la sesion del usuario.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indahl-outside-ruler | Plugin para Claude Code | no aplica | no disponible | MIT | Hugging Face y GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre plugins o herramientas equivalentes de revision previa a publicacion dentro de Claude Code que permitan una comparacion tecnica con datos verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autonoma ni puede evaluarse con benchmarks de MMLU, HumanEval o GSM8K.
- La model card no detalla el contenido de las diez comprobaciones ni los criterios exactos de los veredictos STANDS, MOVES y HOLD.
- El plugin depende de Claude Code y del modelo subyacente de la sesion; su comportamiento puede variar con la version de la herramienta.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; el material de referencia esta redactado en ingles.
- La licencia MIT permite uso comercial, pero el plugin se ejecuta sobre una plataforma de terceros cuyos terminos y politica de privacidad aplican por separado (enlaces en `indahl.ai/privacy` y `indahl.ai/terms`).
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion externa publicada.
- Para produccion, conviene auditar el codigo fuente en GitHub antes de integrarlo en flujos con material sensible.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-outside-ruler
- Repositorio GitHub (espejo): https://github.com/Heuremen-LLC/indahl-outside-ruler
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/outside-ruler
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
