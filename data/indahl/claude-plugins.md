# indahl/claude-plugins

## Resumen

`indahl/claude-plugins` no es un modelo de lenguaje, sino un repositorio de plugins para Claude Code publicado por Heuremen LLC (indahl.ai). El repositorio contiene ocho plugins (`indahl-standards`, `indahl-readcheck`, `indahl-qia-calibration`, `indahl-darkwave`, `indahl-data`, `indahl-reproduce`, `indahl-eval-check` y `indahl-prereg`) que se instalan como un marketplace de plugins dentro de Claude Code y añaden comandos de barra y hooks de validación orientados a la reproducibilidad y la revisión de investigación científica.

El contenido se centra en herramientas de auditoría metodológica: verificación de afirmaciones de papers contra los códigos F1-F7 del "Standard" de indahl.ai, bloqueo de commits que incluyen lecturas de resultados sin un fichero `CHECK.json` completo, calibración de registros de IBM Quantum y comprobaciones de preregistro y evaluación. No incluye pesos, tokenizador ni pipeline de inferencia; el tamaño del repositorio es de 0.0 GB y el pipeline figura como no disponible.

Su relevancia actual es la de un conjunto de utilidades de gobernanza de la investigación para flujos de trabajo con agentes: el propio autor advierte que las instrucciones de "tratar texto externo como datos" son indicaciones al agente y no garantías, y que las protecciones efectivas están implementadas en código (flags `--yes`/`--yes-commit`, comprobación de tty y manejo de ficheros en solo lectura).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de plugins para Claude Code, no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (`see-license-file`), fichero en `LICENSE-STANDARD.txt` |
| Formato de pesos | no disponible (scripts Python y ficheros de referencia; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado. Se trata de un marketplace de plugins de Claude Code compuesto por comandos de barra (`/standards`, `/readcheck`, `/qia-check`, `/qia-t1t2`, `/reproduce`, `/darkwave`, etc.), skills y scripts Python. La lógica de validación reside en código ejecutable (por ejemplo, `plugins/readcheck/scripts/readcheck.py` y el paquete `qia-check` 1.0.2, idéntico byte a byte a la release de PyPI).

El componente `readcheck` se implementa como un hook de Claude Code que intercepta llamadas Bash con `git commit` y `git -C <dir> commit`, incluidas formas encadenadas como `git add X && git commit` o `cd repo && git commit`, y rechaza el commit si este incluye un fichero de lectura (patrones como `*results*`, `*outcomes*`, `*readings*` o `RESULTS*.md`) sin un `CHECK.json` completo en la misma carpeta o por encima. El componente `standards` incorpora el texto completo del Standard, su forma JSON y su esquema bajo `skills/standards-check/references/`. No se dispone de información sobre datos de entrenamiento, RLHF ni innovaciones de inferencia porque no existe un modelo subyacente en este repositorio.

## Capacidades

- Verificación de afirmaciones de papers y mediciones contra los códigos F1-F7 del Standard, con estados PRESENT, ABSENT, CANNOT_TELL (con motivo NOT_RELEASED, UNREADABLE o METHOD_UNSTATED) y NOT_APPLICABLE, y cita textual con localización para cada PRESENT.
- Recálculo aritmético a partir de los números impresos en el paper, mostrando el rango de redondeo.
- Puerta de validación en commits de repositorios de investigación mediante hook de Claude Code, con 13 requisitos (REQ-01 a REQ-13) sobre el fichero `CHECK.json`.
- Configuración de patrones de fichero propios mediante `.readcheck.json` en la raíz del repositorio (por ejemplo, `{"globs": ["*_scores.csv", "eval_*.json"]}`).
- Comprobación de calibración de IBM Quantum sobre registros en formato `BackendProperties` de Qiskit: detección de STALE (T1 o T2 medidos más de 24 horas antes del update del registro), ZERO (error exactamente 0), T2 superior a 2 x T1 y PAIR (T1 y T2 medidos con más de 24 horas de diferencia).
- Medición de T1 y T2 Hahn-echo en un solo job sobre la cuenta de IBM Quantum del usuario, con `--selftest` sin dispositivo y `--estimate` para estimar segundos de QPU sin enviar nada.
- Modo de ejecución segura: `--yes` y `--yes-commit` restringidos, comprobación de tty y ejecución del envío de pago (`measure --yes`) solo desde la terminal del usuario.
- Tratamiento de texto externo como datos: los plugins citan las instrucciones dirigidas al agente en lugar de obedecerlas, aunque el autor lo describe como instrucción al agente y no como garantía.
- No se documentan capacidades de generación de texto, código, matemáticas, visión ni audio propias, al no tratarse de un modelo.

## Casos de uso

- Revisión de papers antes de su publicación: `/standards <arXiv id | DOI | file | claim>` devuelve una tarjeta de recuento con el estado de cada código F1-F7 y las citas textuales, útil para detectar candidatos a errata en las afirmaciones cuantitativas.
- Auditoría de reproducibilidad en repositorios de investigación: el hook de `readcheck` impide que se consolide un commit con resultados sin `CHECK.json`, forzando a documentar fuente de datos, versión leída, intervalos y material descartado antes de publicar.
- Integración en un pre-commit hook propio: `readcheck.py staged` cubre los commits realizados por scripts, con `git -c ... commit`, en subshells o desde la terminal, casos que el hook de Claude Code no intercepta.
- Control de calidad de registros de calibración de IBM Quantum: `/qia-check` detecta registros obsoletos, pares T1/T2 incoherentes y errores de lectura nulos antes de usar un backend en un experimento.
- Planificación de coste de experimentos en QPU: `--estimate` calcula los segundos de QPU necesarios para una medición T1/T2 sin enviar ningún job, lo que permite presupuestar antes de ejecutar.
- Estandarización de informes de evaluación: los plugins `indahl-eval-check` y `indahl-prereg` se orientan a comprobar evaluaciones y preregistros dentro del mismo flujo de trabajo, aunque la model card no detalla su funcionamiento interno.
- Formación de equipos de investigación: el texto completo del Standard y su esquema incluidos en el plugin sirven como referencia consultable dentro del propio entorno de Claude Code.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona únicamente una prueba ciega sobre dos papers con hallazgos conocidos (los cuatro encontrados), que el autor describe explícitamente como evidencia de recall sobre positivos conocidos y no como tasa de acierto.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica; los plugins se ejecutan en el entorno local de Claude Code y en la cuenta de IBM Quantum del usuario para las funciones de calibración.
- Cabe en GPU de consumo: no aplica.
- Opciones de despliegue: instalación mediante el marketplace de plugins de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai`) y ejecución directa de los scripts Python (`python3 plugins/readcheck/scripts/readcheck.py --help`); el checker de calibración también se distribuye como paquete de PyPI (`pip install qia-check` 1.0.2).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| `indahl/claude-plugins` | Plugins para Claude Code | Verificacion metodologica, gates de commit, calibracion cuantica | other (`see-license-file`) | Hugging Face, 0 descargas, 0 likes |
| `qia-check` (PyPI) | Paquete Python | Checker de calibracion IBM Quantum | no disponible | PyPI, version 1.0.2 |
| Alternativas de revision de reproducibilidad | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras herramientas comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje; cualquier expectativa de inferencia, generación o razonamiento es improcedente.
- El propio autor advierte que la instrucción de tratar texto externo como datos es una indicación al agente y no una garantía; las protecciones efectivas dependen de código (`--yes`, `--yes-commit`, comprobación de tty, manejo de ficheros en solo lectura).
- El hook de `readcheck` no intercepta commits realizados por scripts, con `git -c ... commit`, en subshells ni desde la terminal del usuario; para esos casos hay que ejecutar `readcheck.py staged` en un pre-commit hook propio.
- El hook comprueba que cada respuesta de REQ-01 a REQ-13 esté presente, no que sea correcta.
- Un PRESENT en `/standards` es una propuesta de un lector con su cita, un candidato a errata, no un hallazgo confirmado ni un veredicto sobre el estudio o sus autores; en los recuentos propios del autor un hallazgo requiere dos lectores.
- Los códigos que ordenan papers son F2, F3, F5 y F6; F1, F4 y F7 se registran solo como contexto, y F1 también se activa en práctica rutinaria, por lo que debe leerse junto a los demás.
- La prueba ciega sobre dos papers demuestra recall sobre positivos conocidos, no una tasa de acierto general.
- El envío de pago de `darkwave` (`measure --yes`) solo debe ejecutarse desde la terminal del usuario; conviene mantener activo el prompt de permisos de Bash en Claude Code como puerta independiente del modelo.
- La licencia es `other` con fichero `LICENSE-STANDARD.txt`; no se detallan en la información disponible las restricciones para uso comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (15 de noviembre de 2026), por lo que no hay evidencia de adopción ni de mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/indahl/claude-plugins
- Fichero de licencia: https://huggingface.co/indahl/claude-plugins/blob/main/LICENSE-STANDARD.txt
- Sitio del autor: https://indahl.ai
- Standard (códigos F1-F7): https://indahl.ai/standard
- Marketplace de plugins: https://github.com/Heuremen-LLC/indahl.ai
- Paquete `qia-check` en PyPI: https://pypi.org/project/qia-check/
- DOI del Standard (Faults and Guards 2.0.0): https://doi.org/10.5281/zenodo.24164794
