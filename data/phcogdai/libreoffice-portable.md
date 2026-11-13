# Phcogdai/libreoffice-portable

## Resumen

El repositorio `Phcogdai/libreoffice-portable`, publicado en Hugging Face por el usuario Phcogdai, no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en la plataforma bajo la licencia MIT, sin pipeline declarado, sin idiomas especificados y con cero descargas y cero likes en el momento de la consulta. La model card únicamente reproduce la declaración de licencia (`license: mit`) y no aporta descripción, arquitectura ni datos de entrenamiento.

Por el nombre del repositorio y por la ausencia de cualquier metadato propio de un modelo (arquitectura, parámetros, contexto, formato de pesos), la evidencia disponible apunta a una distribución portable de la suite ofimática LibreOffice empaquetada como artefacto, no a un modelo de lenguaje, visión o multimodal. No hay información que permita afirmar que exista un modelo entrenado detrás de este identificador.

Esta ficha se redacta, por tanto, como evaluación del artefacto tal y como aparece publicado, y se marcan de forma explícita como «no disponible» todos los campos técnicos que la información proporcionada no cubre. No debe interpretarse como una ficha de modelo generativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara modelo de IA; el nombre sugiere empaquetado portable de LibreOffice) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO u otros). La model card no incluye sección técnica alguna: solo declara la licencia MIT. El repositorio no declara pipeline, lo que en Hugging Face implica que no se ha etiquetado como tarea de modelado (text-generation, image-text-to-text, etc.).

No se puede confirmar que exista un proceso de entrenamiento asociado. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, mezcla de expertos) sería especulativa y, por tanto, se omite.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declara modo de pensamiento (thinking mode) ni ninguna capacidad especial.
- El único contenido verificable es la licencia MIT y la etiqueta de región `us`.

## Casos de uso

No es posible enumerar casos de uso de inferencia porque no hay evidencia de que el artefacto sea un modelo. Los escenarios realistas se limitan al uso del paquete como software:

- Distribución portable de LibreOffice: si el artefacto contiene una build portable, podría emplearse para llevar la suite ofimática en medios extraíbles sin instalación en el sistema anfitrión.
- Entornos con restricciones de instalación: útil en máquinas corporativas o de laboratorio donde no se permite instalar software y se requiere ofimática desde una carpeta autocontenida.
- Automatización documental: combinado con las herramientas de línea de comandos de LibreOffice (conversión de formatos, generación de PDF), podría integrarse en scripts de procesado por lotes.
- Formación y demostraciones: permite desplegar un entorno ofimático reproducible en aulas o talleres sin alterar el sistema base.
- Aislamiento y pruebas: útil para validar flujos de conversión de documentos en contenedores o máquinas virtuales desechables.
- Archivado y preservación: una copia portable facilita conservar una versión concreta de la suite para reproducir conversiones históricas.

En ningún caso estos usos implican inferencia de un modelo de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay evidencia de que el artefacto sea un modelo que requiera GPU.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; ninguna es aplicable sin un modelo subyacente.
- Latencia y throughput: no disponibles.

Los requisitos reales, si el artefacto es una build portable de LibreOffice, dependerían del sistema operativo, del espacio en disco y de la RAM del equipo anfitrión, datos que la publicación no especifica.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el artefacto no se presenta como modelo de IA. Como referencia de software, la comparación natural sería con las distribuciones oficiales de LibreOffice o con otras suites ofimáticas portables, pero la información proporcionada no permite establecer una comparación técnica con datos verificables.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card descriptiva, ni ficha de uso, ni instrucciones de instalación.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Riesgo de integridad: al no publicarse sumas de verificación ni origen de los binarios, no se puede garantizar que el contenido coincida con una distribución oficial de LibreOffice.
- Riesgo de suplantación: un repositorio con nombre de software ofimático en una plataforma de modelos puede inducir a error; conviene verificar el contenido antes de ejecutarlo.
- Licencia MIT declarada, pero sin archivo de licencia ni aviso de copyright visible en la información disponible; la aplicabilidad de la MIT a binarios de terceros no está aclarada.
- Idiomas y compatibilidad: no declarados.
- No apto para uso en producción como modelo de IA: no existe modelo que desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phcogdai/libreoffice-portable
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios de código o demos).
