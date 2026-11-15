# indahl/indahl-darkwave

## Resumen

Indahl Darkwave no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-darkwave`. Lo desarrolla Heuremen LLC (sitio indahl.ai) y su funcion es medir el giro de fase (phase turn) que aparece en qubits no manipulados tras una lectura a mitad de circuito (mid-circuit readout) en hardware de IBM Quantum, y aplicar la correspondiente correccion de puerta Z virtual a los circuitos del usuario mediante el denominado Darkwave Correction Kit.

El paquete incluye un autotest que se ejecuta en simulador sin necesidad de cuenta, un modo `--check` que lee el backend y construye los circuitos sin enviar nada, una tabla de giros por lectura en grados con banda de confianza del 95 por ciento y una clasificacion (ABOVE, BELOW, CONSISTENT o CANNOT_TELL), y la reescritura de circuitos QPY con la correccion aplicada. Esta pensado para circuitos con mediciones a mitad de circuito o circuitos dinamicos en IBM Quantum que muestran errores de fase en qubits inactivos durante la lectura.

La relevancia es acotada y muy especifica: no compite en la categoria de modelos generativos, sino que se posiciona como herramienta de calibracion y post-procesado para flujos de trabajo cuanticos dentro del ecosistema Claude Code. No se dispone de informacion sobre arquitectura de red neuronal, parametros ni contexto, porque no es un modelo de ese tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (plugin de Claude Code para correccion de fase en IBM Quantum; no es un modelo neuronal) |
| Parametros totales | No disponible (no es un modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Otra (`other`), con nombre `see-license-file` y enlace a LICENSE.txt en el repositorio de Hugging Face |
| Formato de pesos | No aplica; los scripts se distribuyen como Python (`darkwave_kit.py`) con verificacion sha256 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El plugin es un conjunto de scripts en Python (requiere Python 3.10 o superior) que dependen de `qiskit`, `qiskit-ibm-runtime`, `numpy` y `qiskit-aer`, instalados solo con el consentimiento del usuario. La logica central mide el giro de fase observado en qubits no tocados tras una lectura a mitad de circuito y lo compensa con una puerta Z virtual en los circuitos del usuario. El metodo y los datos de referencia proceden del trabajo "A Readout's Kick Is a Turn" (DOI 10.5281/zenodo.23843468).

La distribucion tiene una particularidad tecnica relevante: esta copia en Hugging Face no incluye ficheros ejecutables. Los comandos descargan cada script desde el repositorio publico de GitHub en un commit fijado (`744bcd22548a29dcdc5a261477faccaeebc6938d`) y solo lo ejecutan si el sha256 coincide con el valor embebido en el comando (`a43b1cf8989928dfd3f94b40b4ae5491d31e52e85cec117e315c4ad4fbc6a401` para `darkwave_kit.py`). La version del marketplace propio incluye los scripts empaquetados directamente. El autor indica que la version fue revisada antes de su publicacion por Sage, revisor externo de Heuremen LLC, el 13 de noviembre de 2026.

## Capacidades

- Medicion del giro de fase por lectura en qubits no manipulados, expresado en grados, con banda de confianza del 95 por ciento.
- Clasificacion del resultado frente a cero en cuatro categorias: ABOVE, BELOW, CONSISTENT y CANNOT_TELL.
- Autotest en simulador que planta giros conocidos en cinco qubits simulados, los mide y los corrige, sin necesidad de cuenta de IBM Quantum.
- Modo `--check` que lee el backend y construye los circuitos pero no envia ningun trabajo.
- Aplicacion de la tabla de correccion medida a circuitos propios en formato QPY (`/darkwave apply --table T in.qpy out.qpy`).
- Medicion en hardware real de IBM Quantum mediante `/darkwave measure --backend B --readout 5,6 --targets 4,8`, con envio de un unico trabajo de pago solo si se anade `--yes` en terminal interactiva.
- Reporte de la coherencia conservada junto a la comparacion con el qubit inactivo.
- Integracion como comando de Claude Code (`/darkwave`), no como modelo con tool calling generico.

## Casos de uso

- Calibracion de circuitos dinamicos en IBM Quantum: medir el giro de fase que introduce la lectura a mitad de circuito sobre qubits inactivos y aplicar la correccion Z virtual antes de ejecutar el circuito definitivo, reduciendo errores sistematicos de fase.
- Validacion previa a ejecucion en hardware de pago: usar `--check` para leer el backend y construir los circuitos sin enviar nada, verificando parametros y objetivos antes de gastar tiempo de cola o credito.
- Correccion por lotes de circuitos existentes: aplicar una tabla de correccion medida a ficheros QPY de entrada y salida, integrable en un pipeline de preprocesado antes del envio a IBM Quantum.
- Verificacion en simulador sin cuenta: ejecutar `/darkwave selftest` para comprobar que el kit funciona correctamente en el entorno local (Python 3.10+, qiskit, qiskit-aer) antes de tocar hardware real.
- Auditoria de deriva de calibracion: repetir la medicion sobre los mismos qubits objetivo y comparar las tablas de giro por lectura para detectar cambios en el comportamiento del backend a lo largo del tiempo.
- Documentacion reproducible de experimentos: adjuntar la tabla de giros con su banda del 95 por ciento y su clasificacion frente a cero como evidencia metodologica en publicaciones o informes internos que usen mediciones a mitad de circuito.
- Formacion y prototipado: emplear el autotest y el modo `--check` en entornos docentes para explicar el efecto de la lectura sobre qubits inactivos sin necesidad de credenciales de IBM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas de fidelidad, tasas de error residual ni latencias; solo describe el autotest cualitativo sobre cinco qubits simulados.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un plugin de Python, no un modelo neuronal.
- Requiere Python 3.10 o superior.
- Dependencias: `qiskit`, `qiskit-ibm-runtime`, `numpy` y `qiskit-aer`, instaladas solo con el consentimiento del usuario.
- Las ejecuciones en hardware real necesitan una cuenta propia de IBM Quantum guardada en `qiskit-ibm-runtime`; el envio de circuitos de medicion es de pago en la cuenta del usuario y solo se realiza con `--yes` en terminal interactiva.
- El autotest se ejecuta en simulador local y no necesita cuenta ni red hacia IBM Quantum.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Producto | Tipo | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Indahl Darkwave | Plugin de Claude Code | Correccion de giro de fase por lectura en IBM Quantum | Otra (`see-license-file`) | Hugging Face y marketplace propio de Heuremen |
| Qiskit (herramientas de calibracion) | SDK de computacion cuantica | Construccion y ejecucion de circuitos, calibracion general | Apache 2.0 (segun el propio proyecto Qiskit) | PyPI y GitHub |
| Mitiq (error mitigation) | Libreria de mitigacion de errores | Mitigacion de errores en circuitos cuanticos | GPL-3.0 (segun el propio proyecto) | PyPI y GitHub |

No se dispone de informacion sobre alternativas especificas que midan y corrijan el giro de fase por lectura con la misma metodologia y clasificacion ABOVE/BELOW/CONSISTENT/CANNOT_TELL; esa comparativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento; cualquier uso esperando esas capacidades es un error de categoria.
- El alcance esta restringido a IBM Quantum y a circuitos con mediciones a mitad de circuito o circuitos dinamicos; no cubre otros proveedores ni otros tipos de error.
- El envio a hardware es de pago en la cuenta del usuario y solo se activa con `--yes` en terminal interactiva; el resto de modos no envia trabajos.
- Esta copia de Hugging Face no incluye ejecutables: depende de descargar scripts desde GitHub en un commit fijado y de verificar el sha256; si el repositorio o el hash no coinciden, los comandos no se ejecutan.
- La licencia es `other` con nombre `see-license-file`; las condiciones exactas de uso comercial deben consultarse en LICENSE.txt antes de cualquier despliegue en produccion.
- El plugin contacta unicamente con IBM Quantum mediante la cuenta guardada del usuario; cualquier otro trafico debe considerarse fuera del comportamiento declarado.
- No esta afiliado ni respaldado por IBM; IBM Quantum y Qiskit son marcas de IBM usadas solo para nombrar la compatibilidad.
- El autor declara que no lee datos personales ni almacena nada en servidores, y que el texto descargado se trata como datos, no como instrucciones; conviene verificar esa afirmacion en el codigo antes de usarlo en entornos sensibles.
- No se dispone de datos sobre sesgos, tasas de alucinacion ni limitaciones de idioma porque no aplican a este tipo de artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-darkwave
- Licencia: https://huggingface.co/indahl/indahl-darkwave/blob/main/LICENSE.txt
- Repositorio fuente (GitHub): https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/plugins/darkwave-correction
- Mirror del proyecto: https://github.com/Heuremen-LLC/indahl-darkwave
- Script verificado por sha256: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/744bcd22548a29dcdc5a261477faccaeebc6938d/claude-plugins/plugins/darkwave-correction/scripts/darkwave_kit.py
- Metodo y datos (DOI): https://doi.org/10.5281/zenodo.23843468
- Privacidad: https://indahl.ai/privacy
- Terminos: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai
