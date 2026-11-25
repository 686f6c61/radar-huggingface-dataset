# Huiginn/osintbot-template

## Resumen

`Huiginn/osintbot-template` no es un modelo de lenguaje entrenado, sino un paquete de plantillas publicas para OSINTBot, un asistente de investigacion de fuentes abiertas (OSINT) distribuido como herramienta de linea de comandos. Lo publica el autor Tôn Thất Bảo Toàn bajo licencia MIT y el repositorio de Hugging Face actua unicamente como punto de distribucion de los ficheros de plantilla, la descripcion publica del bot, las habilidades (skills) y el paquete CLI `osintbot-0.1.2.zip`.

El paquete esta pensado para que un nuevo propietario configure su propia instancia de OSINTBot sin heredar memorias, perfiles ni configuracion de maquina de terceros: la primera conversacion (`skills/getting-started/SKILL.md`) pregunta explicitamente idioma, zona horaria, forma de trato y equipo. Incluye flujos de trabajo para OSINT visual y geolocalizacion de fotografias (`osint-dinh-vi-anh`) y para la instalacion del CLI local (`osint-cai-cong-cu`), que solo se ejecuta tras consentimiento explicito del propietario.

Es relevante como ejemplo de empaquetado reproducible y verificable de un agente de investigacion: el zip se publica con digest SHA-256, el instalador comprueba sumas de verificacion y las dependencias opcionales (modelo de geolocalizacion, APIs de busqueda inversa) se instalan en pasos separados con aprobacion adicional. No contiene pesos de modelo ni arquitectura de red neuronal propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado; es un paquete de plantillas y CLI) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el flujo de inicio pregunta el idioma al propietario) |
| Licencia | MIT (pack y wrapper `osint`) |
| Formato de pesos | no disponible (no hay pesos; se distribuye un zip con scripts e instaladores) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido es un conjunto de ficheros de texto y scripts: `description.txt` (descripcion publica de menos de 2.500 caracteres), `metadata.txt` (nombre sugerido, resumen, etiquetas y lista de habilidades), `LICENSE`, dos ficheros `SKILL.md` (`getting-started` y `osint-dinh-vi-anh`, `osint-cai-cong-cu`) y el paquete `cli/osintbot-0.1.2.zip` con su digest SHA-256 (`f65a3f3c22d38db14053bd7367bb4ba63a2ef35994d4b19874612c4bb8259813`).

El CLI se instala en un entorno virtual de Python 3.11 o superior, descarga ExifTool 13.64 oficial y verifica las sumas SHA-256 de `checksums.txt`; cualquier discrepancia aborta la instalacion. La funcionalidad `osint geolocate` es un extra fuera del zip que instala PyTorch para CPU, el codigo fuente fijado de `osv5m` y los pesos `osv5m/baseline` (MIT) junto con el backbone DataComp en `vendor/`, ocupando entre 5 y 6,5 GB. La funcionalidad `osint reverse` solo contacta con APIs oficiales cuando el propietario ha creado su propia clave y ha aceptado los terminos del proveedor. No hay RLHF, DPO ni datos de entrenamiento implicados.

## Capacidades

- Asistente de investigacion OSINT guiado por habilidades declarativas en Markdown (`SKILL.md`).
- Configuracion inicial conversacional: idioma, zona horaria, forma de trato y equipo del propietario.
- OSINT visual y geolocalizacion de fotografias mediante el flujo `osint-dinh-vi-anh` y el comando opcional `osint geolocate`.
- Busqueda inversa de imagenes (`osint reverse`) contra APIs oficiales con clave propia del propietario.
- Extraccion de metadatos EXIF mediante ExifTool 13.64 integrado en el instalador.
- Instalacion del CLI local con verificacion criptografica de integridad (SHA-256).
- Redaccion de borradores de informes, pero sin enviar, publicar ni contactar a nadie por cuenta del propietario.
- No incluye reconocimiento facial de personas privadas ni capacidades de generacion de texto propias (depende del bot o modelo que el propietario conecte).

## Casos de uso

- Verificacion de procedencia de imagenes periodisticas: el flujo `osint-dinh-vi-anh` permite extraer EXIF y acotar la localizacion geografica de una fotografia antes de publicarla, reduciendo el riesgo de difundir contenido descontextualizado.
- Analisis de metadatos en investigaciones de fraude documental: el CLI invoca ExifTool 13.64 con sumas de verificacion, de modo que el analista puede demostrar que la herramienta no ha sido manipulada.
- Despliegue controlado en redacciones o equipos de investigacion: el instalador crea un entorno virtual aislado con paquetes fijados y comprueba `checksums.txt`, lo que facilita la reproducibilidad entre estaciones de trabajo.
- Formacion de nuevos analistas: la skill `getting-started` fuerza una configuracion explicita de idioma, zona horaria y maquina, evitando que el alumno herede ajustes de otra persona.
- Localizacion aproximada de fotografias sin conexion a servicios de pago: el add-on `osint geolocate` instala pesos `osv5m/baseline` en local (5-6,5 GB) y ejecuta inferencia en CPU, sin enviar imagenes a terceros.
- Busqueda inversa de imagenes con trazabilidad legal: `osint reverse` solo consulta APIs oficiales cuando el propietario aporta su clave y acepta los terminos, lo que deja un rastro claro de responsabilidad.
- Auditoria de dependencias en pipelines de seguridad: el zip y su digest publicados permiten integrar la verificacion en un proceso de CI que rechace binarios alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para el paquete base (solo Python 3.11+, ExifTool y conexion de red). El add-on `osint geolocate` usa PyTorch para CPU y no requiere GPU.
- GPU recomendadas: no disponible; el flujo de geolocalizacion esta disenado para CPU.
- GPU de consumo: no aplica; no se documenta soporte CUDA ni Metal.
- Espacio en disco: instalacion base sin cifra publicada; el add-on de geolocalizacion requiere entre 5 y 6,5 GB libres.
- Opciones de despliegue: instaladores nativos `install.ps1` (Windows 64 bits, ejecutable `bin\osint.cmd`) e `install.sh` (Linux y macOS, ejecutable `bin/osint`); en macOS se usa el tarball Unix de ExifTool con Perl para evitar permisos de administrador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Herramienta | Tipo | Parametros | Contexto | Licencia | Distribucion |
|---|---|---|---|---|---|
| Huiginn/osintbot-template | Plantillas y CLI OSINT | no aplica | no disponible | MIT | Hugging Face (zip + SHA-256) |
| Modelos LLM genericos (p. ej. familia Llama, Qwen) | Modelo de lenguaje | miles de millones | decenas de miles de tokens | variable | safetensors/GGUF |
| Frameworks de agentes (p. ej. LangChain, AutoGen) | Libreria de orquestacion | no aplica | depende del modelo | MIT/Apache-2.0 | PyPI |

No se dispone de datos de rendimiento comparables porque el paquete no incluye un modelo evaluable; la comparacion se limita al tipo de artefacto y su licencia.

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo ni puede evaluarse con MMLU, HumanEval o GSM8K.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- La model card advierte explicitamente contra el doxxing, el reconocimiento facial de personas privadas, el bypass de captchas o muros de pago y el uso de datos filtrados o robados.
- El bot no contacta, publica, elimina ni gasta por cuenta del propietario; solo redacta borradores cuando se le pide.
- La instalacion del add-on de geolocalizacion requiere aprobacion separada y consume 5-6,5 GB de disco.
- `osint reverse` exige que el propietario cree su propia clave y acepte los terminos del proveedor; el paquete no registra cuentas.
- Riesgo de alucinacion: no aplica al paquete, pero si al modelo que el propietario conecte al bot.
- El cumplimiento normativo (proteccion de datos) recae en el usuario segun la legislacion de su jurisdiccion.
- No se documentan sesgos, idiomas soportados ni limites de contexto porque no hay modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Huiginn/osintbot-template
- Descarga del CLI (verificar digest antes de instalar): https://huggingface.co/Huiginn/osintbot-template/resolve/main/cli/osintbot-0.1.2.zip
- Digest SHA-256 del zip: `f65a3f3c22d38db14053bd7367bb4ba63a2ef35994d4b19874612c4bb8259813`
- ExifTool oficial (version 13.64 referenciada por el instalador): https://exiftool.org/
- Pesos `osv5m/baseline` (MIT) para el add-on de geolocalizacion: no disponible en la informacion proporcionada
- Paper o blog del proyecto: no disponible en la informacion proporcionada
