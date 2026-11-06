# siamcafe/bomai

## Resumen

BOM AI es un paquete de instalación distribuido a través de Hugging Face bajo el identificador `siamcafe/bomai`, desarrollado por el usuario siamcafe. No se trata de un modelo de pesos en sentido estricto: el repositorio contiene scripts de instalación (`Install-BOM-AI-Online.bat` para Windows, `install-bom-ai-linux.sh` para Linux y `install-bom-ai-mac.zip` para macOS) que despliegan un asistente de IA local orientado al idioma tailandés. El tamaño del repositorio es de 0,0 GB, lo que confirma que no aloja pesos de modelo, sino únicamente artefactos de instalación.

El instalador orquesta componentes de terceros: Ollama como motor de inferencia, Open WebUI como interfaz de chat y Python como runtime. El autor ofrece dos niveles de despliegue: uno ligero basado en un modelo Qwen de 4.200 millones de parámetros cuantizado a Q4_K_M que funciona en CPU, y otro profesional basado en GLM-4.7 de 12.000 millones de parámetros también en Q4_K_M, que requiere una GPU con al menos 12 GB de VRAM. La licencia del paquete es MIT.

La relevancia de este artefacto es limitada desde el punto de vista de la investigación en IA: no publica arquitectura propia, ni datos de entrenamiento, ni benchmarks. Su interés radica en ser un ejemplo de distribución "one-click" de asistentes locales empaquetados sobre Ollama y Open WebUI, con un enfoque específico en la ausencia de caracteres Han en las respuestas (lo que el autor denomina "Han Fix HF-1.0").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo; el instalador despliega modelos de terceros) |
| Parametros totales | no disponible como modelo propio; los componentes desplegados son Qwen 4.2B (nivel Light) y GLM-4.7 12B (nivel Pro) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M en ambos niveles (Light y Pro) |
| Idiomas soportados | tailandés (objetivo declarado del asistente); inglés mencionado en el repositorio asociado `siamcafe/bom-ai` |
| Licencia | MIT (componentes: Ollama MIT, Open WebUI BSD-3-Clause, Python PSF) |
| Formato de pesos | no disponible (el repositorio contiene scripts `.bat`, `.sh` y `.zip`, no safetensors ni GGUF propios) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura propia ni sobre un proceso de entrenamiento. El artefacto es un instalador que configura un stack local compuesto por Ollama (servidor de inferencia), Open WebUI (interfaz conversacional) y Python. Los modelos que se descargan en tiempo de instalación son Qwen 4.2B en cuantización Q4_K_M para el nivel Light y GLM-4.7 12B en Q4_K_M para el nivel Pro, ambos modelos de terceros cuyas arquitecturas y datos de entrenamiento no se documentan en este repositorio.

La única innovación técnica declarada por el autor es el "Han Fix HF-1.0", descrito como una aplicación de tres capas que garantiza cero filtraciones de caracteres Han en 550 pruebas (500 vía API y 50 vía navegador), junto con una configuración de muestreo fijada que el autor denomina "GOD CONFIG v9.1". No se detalla el mecanismo técnico de este filtro ni se aportan métricas reproducibles más allá del recuento de pruebas. La matriz de pruebas T01-T20 se declara superada en los tres sistemas operativos.

## Capacidades

- Asistente conversacional local en tailandés, ejecutado íntegramente en la máquina del usuario sin dependencia de servicios en la nube.
- Despliegue mediante instalador de un clic en Windows, Linux y macOS.
- Dos perfiles de hardware: ejecución en CPU (nivel Light, Qwen 4.2B Q4_K_M) y ejecución en GPU con 12 GB o más de VRAM (nivel Pro, GLM-4.7 12B Q4_K_M).
- Interfaz web de chat proporcionada por Open WebUI.
- Filtrado de caracteres Han en las respuestas (Han Fix HF-1.0) para preservar la pureza del tailandés en la salida.
- Capacidades heredadas de los modelos subyacentes (generación de texto, razonamiento y conversación), si bien no se documentan en este repositorio.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente personal en tailandés sin conexión: el instalador configura Ollama y Open WebUI en local, de modo que el usuario puede conversar en tailandés sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Despliegue en equipos sin GPU: el nivel Light con Qwen 4.2B en Q4_K_M está pensado para ejecutarse en CPU, lo que permite usar el asistente en portátiles convencionales o estaciones de trabajo sin acelerador dedicado.
- Estaciones de trabajo con GPU de gama media: el nivel Pro con GLM-4.7 12B en Q4_K_M aprovecha tarjetas con 12 GB o más de VRAM para obtener respuestas de mayor calidad en el mismo entorno local.
- Evaluación de stacks de asistentes locales: el paquete sirve como referencia para probar la combinación Ollama + Open WebUI sin tener que configurar manualmente cada componente.
- Entornos educativos o de demostración: al ser un instalador de un clic con licencia MIT, facilita montar talleres o pruebas de concepto de asistentes conversacionales en tailandés.
- Filtrado lingüístico en producción: el Han Fix HF-1.0 puede interesar a quienes necesiten garantizar que un asistente en tailandés no introduzca caracteres chinos en las respuestas, aunque el mecanismo no está documentado en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta el resultado de su matriz de pruebas interna (T01-T20 superada en los tres sistemas operativos) y la ausencia de filtraciones de caracteres Han en 550 prompts, sin cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- Nivel Light: sin requisito de GPU; diseñado para ejecutarse en CPU con Qwen 4.2B en Q4_K_M. La VRAM necesaria es de 0 GB, aunque se requiere RAM del sistema suficiente para cargar el modelo (no cuantificada en la documentación).
- Nivel Pro: requiere GPU con 12 GB o más de VRAM para GLM-4.7 12B en Q4_K_M. Tarjetas compatibles por capacidad incluyen RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100; la documentación no confirma compatibilidad específica con ninguno de estos modelos.
- Despliegue: Ollama como motor de inferencia y Open WebUI como interfaz, instalados automáticamente por los scripts del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | BOM AI (este repositorio) | Ollama (directo) | LM Studio | GPT4All |
|---|---|---|---|---|
| Naturaleza | Instalador de asistente local | Motor de inferencia | Aplicación de escritorio | Aplicación de escritorio |
| Modelos incluidos | Qwen 4.2B y GLM-4.7 12B (descarga) | Catálogo amplio | Catálogo amplio | Catálogo propio |
| Enfoque lingüístico | Tailandés | Neutro | Neutro | Neutro |
| Licencia | MIT | MIT | Propietaria | MIT |
| Interfaz web | Open WebUI | No incluida | No | No |
| Soporte multi-OS | Windows, Linux, macOS | Windows, Linux, macOS | Windows, Linux, macOS | Windows, Linux, macOS |

La comparación es aproximada porque BOM AI no es un modelo sino un empaquetado; se incluye para situar el artefacto frente a alternativas de despliegue local.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: es un instalador, por lo que cualquier evaluación de calidad debe hacerse sobre los modelos subyacentes (Qwen 4.2B y GLM-4.7 12B), no sobre este artefacto.
- No se documentan sesgos, datos de entrenamiento ni evaluación de alucinación de los modelos desplegados.
- El enfoque está limitado al tailandés; el soporte de otros idiomas no está confirmado en la documentación.
- El "Han Fix HF-1.0" y la "GOD CONFIG v9.1" no cuentan con especificación técnica pública ni resultados reproducibles más allá del recuento de pruebas del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su fiabilidad.
- La licencia MIT cubre el instalador, pero los modelos descargados (Qwen y GLM-4.7) tienen sus propias licencias, que el usuario debe verificar antes de un uso comercial.
- Los scripts de instalación se ejecutan con privilegios sobre el sistema del usuario; conviene revisar su contenido antes de ejecutarlos en entornos de producción.
- No se dispone de información sobre latencia, throughput ni requisitos de RAM para el nivel Light.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/siamcafe/bomai
- Repositorio asociado con pesos GGUF: https://huggingface.co/siamcafe/bom-ai
- Árbol de archivos del repositorio asociado: https://huggingface.co/siamcafe/bom-ai/tree/main
- Sitio web del proyecto: https://bomai.app
- Repositorio en GitHub: https://github.com/siamcafe/bomai
