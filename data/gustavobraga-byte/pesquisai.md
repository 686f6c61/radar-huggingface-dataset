# gustavobraga-byte/Pesquisai

## Resumen

El proyecto PesquisAI, publicado en HuggingFace por el usuario gustavobraga-byte, no corresponde a un modelo de lenguaje preentrenado ni a un sistema de IA generativa convencional. Según la información disponible, se trata de una "skill" denominada `cep-ufv` que automatiza la generación del paquete documental para la sumisión de proyectos al Comité de Ética en Pesquisa con Seres Humanos de la Universidad Federal de Viçosa (CEP/UFV), en Brasil.

La skill está diseñada para rellenar únicamente los campos variables de las plantillas oficiales publicadas en https://cep.ufv.br/modelos/, generando simultáneamente archivos .docx editables y .pdf. El repositorio incluye 14 documentos, entre ellos el TCLE (Término de Consentimiento Libre e Informado), TALE (Término de Asentimiento), anuencia institucional, cronograma, presupuesto, carta-respuesta y un checklist de conformidad. La herramienta no sustituye al investigador: se limita a respetar el texto verbatim de los modelos oficiales y a señalar los campos pendientes mediante un archivo `pendencias.txt`.

No se han publicado datos sobre arquitectura, número de parámetros, longitud de contexto ni capacidad de razonamiento. Por tanto, esta ficha describe una utilidad documental, no un modelo de IA en el sentido estricto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de lenguaje; el repositorio contiene scripts Python y plantillas) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el README y los documentos están en portugués de Brasil, pero no se especifica idioma del modelo) |
| Licencia | MIT (según README del repositorio; no especificada en HuggingFace) |
| Formato de pesos | No disponible (no es un modelo con pesos) |

## Arquitectura y entrenamiento

No procede hablar de arquitectura de red neuronal ni de proceso de entrenamiento, ya que PesquisAI no es un modelo preentrenado. El repositorio contiene una estructura de software compuesta por un archivo `SKILL.md` con las instrucciones de uso, un script `run.py` que actúa como generador, una carpeta `modelos/` con las plantillas oficiales en formato PDF y ODT, documentación adicional y pruebas automatizadas. El script depende de las librerías Python `python-docx`, `reportlab`, `pymupdf` y `pdfplumber`, y funciona sin conexión a red ni servicios externos. No hay datos de tokens de entrenamiento, composición de dataset ni técnicas como RLHF o DPO.

## Capacidades

- Generación del paquete documental completo para el CEP/UFV: 14 archivos en dos formatos (.docx y .pdf) a partir de un archivo JSON de entrada.
- Relleno automático de campos variables dentro de plantillas oficiales, respetando el texto verbatim.
- Validación de campos pendientes mediante la creación de `pendencias.txt` con los marcadores `[PREENCHER]` que deben ser resueltos por el investigador.
- Detección de inconsistencias en la entrada mediante el modo `--validar-apenas`, sin generar archivos.
- Generación de un checklist de conformidad con el estado de cada requisito (STATUS por ítem).
- Inclusión de guías paso a paso (etapas 0 a 8) y documentación de la legislación aplicable: Lei 14.874/2024, Decreto 12.651/2025, Res. 466/2012, Res. 510/2016, NO 001/2013 y LGPD.
- No soporta tool calling, generación de texto libre, razonamiento multi-step ni capacidades multimodales.

## Casos de uso

- Preparación de sumisión al CEP/UFV: un investigador rellena un archivo `projeto-exemplo.json` con los datos de su estudio y ejecuta `python3 run.py projeto.json --out outputs-cep/` para obtener el paquete documental completo listo para revisión.
- Generación de TCLE para adultos: la skill produce el Término de Consentimiento Libre e Informado ajustado al modelo 2026, evitando errores de formato y garantizando que solo se modifiquen los campos permitidos.
- Generación de TALE para menores de edad: similar al TCLE, pero con el Término de Asentimiento correspondiente, útil en investigaciones con población infantil.
- Elaboración de anuencia institucional y declaración de sigilo: la herramienta genera estos documentos a partir de las plantillas oficiales, reduciendo el tiempo de preparación manual.
- Respuesta a pendencias del comité: el script genera la carta-respuesta vacía y marca los campos a modificar en el proyecto, lo que facilita la corrección de observaciones éticas.
- Verificación de conformidad documental: el modo `--validar-apenas` permite comprobar si el proyecto cumple todos los ítems del checklist 2021 antes de la sumisión, reduciendo el riesgo de rechazos por documentación incompleta.
- Gestión de plazos y cronograma: la skill genera el cronograma con el compromiso expreso del investigador, útil para planificar la recolección de datos respetando los tiempos del comité (2–3 meses estimados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no presenta métricas de calidad, velocidad ni comparaciones con otros sistemas, ya que no es un modelo de IA generativa.

## Requisitos de hardware

- No aplica: no requiere GPU, VRAM ni hardware especializado para inferencia.
- Ejecución en CPU con Python 3. Las dependencias son `python-docx`, `reportlab`, `pymupdf` y `pdfplumber`.
- Puede ejecutarse en cualquier ordenador de sobremesa o portátil con Python instalado.
- No se ha especificado latencia ni throughput; el proceso es batch y depende de la complejidad de los documentos generados.
- Opciones de despliegue: ejecución directa desde línea de comandos, integración en Google Colab mediante el enlace disponible, o como parte de un pipeline de documentación en un repositorio GitHub.

## Comparativa con modelos similares

No disponible. PesquisAI no es un modelo de IA entrenado, por lo que no existen alternativas comparables en términos de parámetros, contexto o rendimiento. Las herramientas de automatización documental para comités de ética no suelen publicarse como modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede responder preguntas, redactar textos libres ni realizar razonamiento autónomo. Solo rellena campos dentro de plantillas predefinidas.
- Está limitado exclusivamente a los modelos oficiales del CEP/UFV. Si las plantillas cambian, la skill puede quedar obsoleta y requerir actualización manual.
- No genera la hoja de rostro, que debe obtenerse desde la Plataforma Brasil. La responsabilidad de su presentación recae en el investigador o el orientador.
- Los documentos generados requieren revisión humana. El script no valida el contenido científico ni la adecuación ética del proyecto.
- La licencia MIT se aplica al código y la documentación, pero las plantillas en `modelos/` pertenecen al CEP/UFV y se distribuyen con fines orientativos. Debe verificarse su vigencia en https://cep.ufv.br/modelos/.
- No hay soporte de tool calling, integración con agentes externos ni capacidades multilingües. Los textos generados están en portugués.
- El proyecto se publica con 0 descargas y 0 likes en HuggingFace, lo que indica una adopción muy limitada o un estado inicial de desarrollo.

## Enlaces

- HuggingFace: https://huggingface.co/gustavobraga-byte/Pesquisai
- GitHub: https://github.com/gustavobraga-byte/PesquisAI
- Google Colab: https://colab.research.google.com/github/gustavobraga-byte/PesquisAI/
