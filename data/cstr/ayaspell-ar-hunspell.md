# cstr/ayaspell-ar-hunspell

## Resumen

AyaSpell Arabic dictionary for Hunspell es un paquete de recursos lingüísticos para la corrección ortográfica del árabe, no un modelo de lenguaje neuronal. Contiene el diccionario ortográfico árabe en formato Hunspell (`ar.aff` y `ar.dic`) y un tesauro árabe en formato MyThes (`th_ar.dat`), empaquetados de forma byte a byte idéntica al paquete de diccionarios de LibreOffice en el commit `951bb429a4d846699b02e7adb4fc6fca128c6bae`, correspondiente a la versión 3.5 de AyaSpell.

El recurso lo publica el usuario `cstr` en Hugging Face, pero el trabajo original procede del proyecto AyaSpell, con Mohamed Kebdani como autor del diccionario (2006-2008) y Taha Zerrouki del tesauro y del proyecto (2006-2009); el empaquetado para OpenOffice lo realizó Ahmad Farghal. Su relevancia radica en que proporciona una base lista para usar en correctores ortográficos compatibles con Hunspell para árabe, un idioma con morfología rica y compleja donde los correctores genéricos rinden peor.

Al no ser un modelo neuronal, no dispone de parámetros, contexto, cuantización ni pesos en safetensors o GGUF. Se distribuye como ficheros de texto plano consumibles por motores Hunspell y MyThes, con un `manifest.json` que incluye el SHA-256 de cada fichero para verificación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (recurso lingüístico, no modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ficheros de texto plano) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | MPL-1.1 (con opción de GPL 2.0 o LGPL 2.1, según `COPYING.txt`) |
| Formato de pesos | no disponible; formatos de recurso: Hunspell (`ar.aff`, `ar.dic`) y MyThes (`th_ar.dat`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay red neuronal, ni entrenamiento, ni ajuste por RLHF/DPO. El paquete contiene un diccionario ortográfico Hunspell compuesto por un fichero de afijos (`ar.aff`) y un fichero de lexemas (`ar.dic`), más un tesauro en formato MyThes (`th_ar.dat`) que aporta sinónimos y relaciones léxicas.

Los ficheros son copia byte a byte del empaquetado de LibreOffice en el commit indicado, sin modificaciones. El repositorio actúa como forma fuente de la distribución y añade un `manifest.json` con los hashes SHA-256 de cada fichero para verificación. La autoría original corresponde a Mohamed Kebdani (diccionario) y Taha Zerrouki (tesauro y proyecto), con empaquetado de Ahmad Farghal.

## Capacidades

- Corrección ortográfica de texto árabe mediante motores compatibles con Hunspell.
- Expansión de afijos y morfología árabe a partir de las reglas de `ar.aff`.
- Consulta de sinónimos y relaciones léxicas mediante el tesauro MyThes (`th_ar.dat`).
- Integración en procesadores de texto y suites ofimáticas que consuman diccionarios Hunspell/MyThes.
- Verificación de integridad de los ficheros mediante los hashes SHA-256 de `manifest.json`.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente.

## Casos de uso

- Corrección ortográfica en LibreOffice y OpenOffice: el paquete es idéntico al que distribuye LibreOffice, por lo que se puede cargar directamente como diccionario árabe (`hunspell -d ar`) en estas suites.
- Procesamiento de textos árabes en pipelines de NLP: usar Hunspell como filtro de validación léxica previo a tareas de normalización o etiquetado morfológico.
- Editores de código y herramientas de línea de comandos: integración con `hunspell` o `aspell` para revisión ortográfica de documentación y ficheros en árabe.
- Aplicaciones de escritorio que descarguen diccionarios bajo demanda: el modelo documenta que Quds Office descarga este bundle a petición del usuario, patrón reutilizable en otras aplicaciones.
- Búsqueda y sustitución con tolerancia a errores: combinar el diccionario con el tesauro para sugerencias de sinónimos en herramientas de redacción.
- Verificación de integridad en distribución: usar los SHA-256 de `manifest.json` para validar que los ficheros descargados no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: son ficheros de texto plano consumidos por un motor Hunspell/MyThes en CPU.
- Huella en disco reducida (ficheros de diccionario y tesauro); no se especifica el tamaño exacto en la información disponible.
- Compatible con cualquier máquina que ejecute un motor Hunspell, incluidos equipos de escritorio y servidores modestos.
- Opciones de despliegue: motor `hunspell` nativo, librerías Hunspell para distintos lenguajes, o suites ofimáticas que integren Hunspell/MyThes.
- Latencia y throughput: no disponibles; dependen del motor y del tamaño del texto, no del recurso en sí.

## Comparativa con modelos similares

| Recurso | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| cstr/ayaspell-ar-hunspell | árabe | Hunspell + MyThes | MPL-1.1 (tri-licencia original) | Hugging Face |
| Diccionarios de LibreOffice (árabe) | árabe | Hunspell + MyThes | GPL/LGPL/MPL según paquete | Repositorio LibreOffice |
| Proyecto AyaSpell upstream (linuxscout/ayaspell) | árabe | Hunspell + MyThes | GPL 2.0 / LGPL 2.1 / MPL 1.1 | GitHub / SourceForge |

No se dispone de datos de rendimiento comparativo entre estos recursos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas de razonamiento; su función es exclusivamente ortográfica y léxica.
- Cobertura limitada al árabe; no soporta otros idiomas.
- La calidad de la corrección depende de la cobertura del diccionario original (AyaSpell 3.5, con autores de 2006-2009) y de las reglas de afijos, sin actualizaciones recientes documentadas.
- Licencia MPL-1.1 en esta distribución, con opción de GPL 2.0 o LGPL 2.1 según `COPYING.txt`; conviene revisar las condiciones antes de uso comercial o de redistribución modificada.
- Los ficheros se distribuyen sin modificar; cualquier corrección o ampliación debe realizarse en el proyecto upstream.
- Riesgo de falsos negativos y positivos ortográficos inherente a los diccionarios Hunspell, especialmente con neologismos, dialectos y nombres propios.
- No se documentan sesgos ni alucinaciones en el sentido de modelos generativos, pero sí posibles lagunas léxicas.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/ayaspell-ar-hunspell
- Proyecto AyaSpell (upstream): http://ayaspell.sourceforge.net/
- Repositorio linuxscout/ayaspell: https://github.com/linuxscout/ayaspell
- Diccionarios de LibreOffice (árabe, commit referenciado): https://github.com/LibreOffice/dictionaries/tree/951bb429a4d846699b02e7adb4fc6fca128c6bae/ar
- Licencia MPL 1.1: https://www.mozilla.org/en-US/MPL/1.1/
