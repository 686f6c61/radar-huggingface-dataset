# nevernotnic/cs2-skin-changer

## Resumen

`nevernotnic/cs2-skin-changer` es un repositorio alojado en Hugging Face que, pese a su denominación y a las etiquetas propias de la plataforma, no contiene un modelo de inteligencia artificial. La model card describe una supuesta aplicación ejecutable para Windows 10/11 de 64 bits, distribuida como archivo ZIP de 4,8 MB con contraseña de extracción, orientada a modificar aspectos (skins) del videojuego Counter-Strike 2. No se declara arquitectura de red neuronal, parámetros, contexto ni pipeline de inferencia.

El contenido del repositorio no guarda relación con el ecosistema de IA open source: no hay pesos en safetensors, GGUF ni ningún otro formato de modelo, ni referencias a datasets, entrenamiento o evaluación. Los enlaces de descarga apuntan a binarios alojados en GitHub bajo nombres de archivo incoherentes con el propósito declarado (por ejemplo, un supuesto macro de pesca), lo que constituye una señal de alarma clara sobre la legitimidad del artefacto.

Esta ficha se redacta, por tanto, como advertencia técnica: no existe un modelo evaluable y los datos habituales de una ficha de modelo no están disponibles. Se recomienda no ejecutar los binarios enlazados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe una aplicación Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un ejecutable `.exe`, no pesos de modelo) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, proceso de entrenamiento, corpus de datos, número de tokens ni técnicas de alineación como RLHF o DPO. La model card se limita a enumerar características de una aplicación de escritorio (aceleración por GPU con CUDA, TensorRT, DirectML y OpenCL, copia de seguridad del binario original, instalación en un clic) sin aportar ninguna evidencia técnica verificable.

No hay información sobre innovaciones técnicas, decodificación especulativa, atención lineal ni ningún otro mecanismo propio de modelos generativos. El repositorio no contiene artefactos de modelo.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe real; las etiquetas de idioma del repositorio no van acompañadas de ninguna funcionalidad descrita.
- La única funcionalidad descrita es la modificación de skins en Counter-Strike 2 mediante un ejecutable de Windows, sin documentación técnica que la respalde.

## Casos de uso

- No procede: al no existir un modelo de IA, no hay escenarios de inferencia, generación o razonamiento que puedan plantearse.
- Evaluación de seguridad: el repositorio puede emplearse como caso de estudio de campañas de distribución de binarios sospechosos en plataformas de modelos (ZIP con contraseña, ejecutable que requiere permisos de administrador, enlaces a repositorios de GitHub ajenos al propósito declarado).
- Auditoría de cadena de suministro: sirve para ilustrar la necesidad de verificar hashes, firmas y procedencia antes de ejecutar artefactos descargados desde Hugging Face.
- Formación en higiene de seguridad: ejemplo práctico de indicadores de riesgo (nombres de archivo incoherentes, instrucciones para desactivar avisos de SmartScreen o Defender).
- Monitorización de repositorios: caso de uso para herramientas que detectan repositorios que no contienen modelos pese a estar alojados en un hub de IA.
- No se identifican casos de uso legítimos de procesamiento de lenguaje natural, visión o generación de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que cargar.
- GPU recomendadas: no aplica; la model card menciona CUDA, TensorRT, DirectML y OpenCL para el ejecutable descrito, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es un modelo.
- Latencia y throughput: no disponibles; las cifras de milisegundos que aparecen en la model card (35 ms, 20 ms, 31 ms) no están respaldadas por ninguna medición ni metodología.
- Requisitos declarados del ejecutable: Windows 10/11 de 64 bits, arquitectura x64 (Intel o AMD), 4,8 MB de paquete y menos de 59 MB de RAM según el autor, datos no verificables.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA con el que comparar; las alternativas de la misma categoría serían otras aplicaciones de modificación de skins, fuera del ámbito de esta ficha.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni pipeline.
- La model card incluye instrucciones para ejecutar un binario como administrador y para desactivar o ignorar avisos de Windows Defender y SmartScreen, práctica de alto riesgo.
- El archivo ZIP se distribuye con contraseña (`2026`), técnica habitual para evadir análisis automatizados de antivirus.
- El nombre del ejecutable (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`) no guarda relación con el propósito declarado (cambio de skins de CS2), lo que sugiere reutilización de artefactos de origen desconocido.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no vinculados al autor del repositorio de Hugging Face.
- Riesgo de malware, robo de credenciales o modificación no autorizada del sistema si se ejecuta el binario.
- La licencia MIT declarada afecta únicamente al contenido del repositorio y no otorga ninguna garantía sobre los binarios externos enlazados.
- Uso comercial: sin sentido en el contexto de un modelo; el uso del ejecutable podría infringir los términos de servicio de Counter-Strike 2 y de Steam.
- No se han identificado sesgos de modelo ni riesgos de alucinación porque no hay modelo; el riesgo relevante es de seguridad informática.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nevernotnic/cs2-skin-changer
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/Ingrid8835/cs2-skin-changer/releases/latest
- No se han encontrado papers, blogs, demos ni repositorios oficiales adicionales en la información disponible.
