# Pepe1321423/drift-executor

## Resumen

`Pepe1321423/drift-executor` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un repositorio alojado en Hugging Face que distribuye un ejecutable binario para Windows x64 (`drift-executor-v1.2.0-win64.exe`, build `v2.4.9`), empaquetado en un archivo ZIP de 8,9 MB protegido con la contraseña `2026`. La model card se presenta como una página de descarga de software, no como la documentación de un modelo entrenado.

El contenido descrito corresponde a lo que la propia model card denomina un "roblox executor": una herramienta que enlaza con el proceso del cliente de Roblox, inyecta scripts en su máquina virtual Luau y ofrece funciones como `hookmetamethod`, `getgc` y la Drawing API, con una compatibilidad declarada del 98 % con el conjunto de pruebas sUNC. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados al repositorio.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto, cuantizaciones ni capacidades lingüísticas, porque tales artefactos no existen en la información proporcionada. El interés para desarrolladores e investigadores es el de una advertencia: un repositorio con etiquetas de idioma y licencia MIT que en realidad distribuye un binario de terceros, con un ejecutable ofuscado y sin trazabilidad de código fuente, lo que constituye un vector de riesgo de seguridad habitual en este tipo de publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implican capacidad lingüística del binario) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; build `v2.4.9`, identificador `4CCD80ABF1`) |

## Arquitectura y entrenamiento

No aplica. No existe un modelo entrenado, ni un transformer, ni pesos en safetensors o GGUF. El artefacto descrito es un binario compilado para Windows x64 que, según la model card, opera mediante enlace a procesos ("instant client attach"), un puente con la máquina virtual Luau, inyección de scripts y sincronización de offsets tras los parches del cliente. La model card menciona métricas de consumo de memoria en tiempo de ejecución (menos de 45 MB y menos de 39 MB de RAM en distintos subsistemas) y un sondeo a 337 Hz, pero no documenta ningún proceso de entrenamiento, dataset, RLHF ni innovación en aprendizaje automático.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión: el repositorio no contiene un modelo de lenguaje.
- No hay soporte de tool calling ni de function calling en el sentido de un LLM.
- No hay soporte de agentes ni de razonamiento multi-paso basado en modelo.
- Las funciones descritas en la model card son de manipulación de un cliente de juego: auto-ejecución de directorios, enlace a proceso, `hookmetamethod`, `getgc`, Drawing API y un "script hub" con presets en la nube.
- La declaración de 14 idiomas en los metadatos no se corresponde con ninguna capacidad multilingüe verificable del binario.

## Casos de uso

- Ninguno recomendado en un contexto de desarrollo o investigación de IA. El repositorio no ofrece un modelo que pueda integrarse en pipelines de NLP, generación de código, RAG ni agentes.
- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar qué modificaciones realiza sobre el proceso objetivo y qué tráfico de red genera.
- Estudio de campañas de distribución en plataformas de modelos: el caso ilustra cómo se reutilizan etiquetas de idioma, licencia y pipeline para posicionar binarios ajenos al ecosistema de IA.
- Formación en higiene de cadena de suministro: ejemplo de por qué conviene verificar el contenido real de un repositorio antes de descargarlo.
- Monitorización de repositorios: detección automática de publicaciones que distribuyen ejecutables con contraseña de extracción, patrón frecuente en la distribución de software no verificado.
- No procede su uso en producción, atención al cliente, generación de código ni ninguna otra aplicación de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del binario (compatibilidad declarada del 98 % con sUNC, consumo de RAM inferior a 45 MB y 39 MB, sondeo a 337 Hz), pero no son resultados de benchmarks de modelos de lenguaje y no se han verificado de forma independiente.

## Requisitos de hardware

- Plataforma: Windows 10 u 11 de 64 bits, sobre procesadores Intel o AMD x64.
- VRAM: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card solo declara consumo de RAM y frecuencia de sondeo, sin metodología de medición.
- La instalación descrita exige extraer el ZIP con contraseña y ejecutar el binario como administrador, lo que amplía los privilegios del proceso.

## Comparativa con modelos similares

| Criterio | `Pepe1321423/drift-executor` | Modelo de lenguaje open source típico (referencia genérica) |
|---|---|---|
| Naturaleza del artefacto | Binario `.exe` para Windows x64 | Pesos en safetensors/GGUF |
| Parámetros | no disponible | Depende del modelo |
| Contexto | no disponible | Depende del modelo |
| Licencia | MIT declarada | Variable (Apache 2.0, MIT, licencias comunitarias) |
| Código fuente auditable | no disponible | Habitualmente disponible |
| Uso en pipelines de IA | no aplica | Sí |

No se identifican en la información proporcionada modelos comparables de la misma categoría, porque la categoría no es la de un modelo de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; las etiquetas de idioma y la licencia MIT no describen ninguna capacidad del binario.
- Distribución de un ejecutable ofuscado, protegido con contraseña de extracción y sin código fuente ni compilación reproducible: riesgo elevado de software malicioso.
- La propia model card reconoce que Windows Defender y SmartScreen pueden generar alertas y recomienda desactivarlas o añadir exclusiones, práctica que reduce la protección del sistema.
- La ejecución como administrador y el enlace a procesos de terceros implican acceso privilegiado al sistema y posibles conflictos con los términos de servicio del software objetivo.
- No hay verificación independiente de las cifras declaradas (compatibilidad, consumo de memoria, frecuencia de sondeo).
- Cero descargas y cero "likes" en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.
- La licencia MIT declarada no aclara la titularidad del binario ni la procedencia del código, por lo que su uso comercial o en producción no está amparado por ninguna garantía.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Pepe1321423/drift-executor
- Repositorio citado en la model card: https://github.com/GuillaumeHu962/drift-executor
- Archivo de release citado: https://github.com/GuillaumeHu962/drift-executor/releases/latest/download/drift-executor-v1.2.0-win64.zip
- Página de releases citada: https://github.com/GuillaumeHu962/drift-executor/releases/latest
