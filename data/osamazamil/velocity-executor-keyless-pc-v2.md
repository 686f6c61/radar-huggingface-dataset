# OSAMAZAMIL/velocity-executor-keyless-pc-v2

## Resumen

`OSAMAZAMIL/velocity-executor-keyless-pc-v2` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Pese a la categoría del sitio, el contenido publicado es la model card de un supuesto ejecutor de scripts para Windows (`Velocity Executor Keyless PC V2`, build `v2.1.7`), empaquetado como un archivo ZIP de 4,8 MB con contraseña de descompresión y un ejecutable `.exe` que se distribuye a través de enlaces a GitHub Releases de terceros.

El artefacto se presenta como una herramienta "keyless" con compatibilidad declarada del 98 % con sUNC, editor Monaco, hub de scripts y ejecución multi-instancia. No se describe ninguna arquitectura neuronal, ningún conjunto de datos de entrenamiento, ningún tokenizador ni pesos en formato estándar (safetensors, GGUF, etc.). El propio autor no declara pipeline, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde el punto de vista de la evaluación técnica, este repositorio **no es evaluable como modelo**: no hay parámetros, no hay contexto, no hay benchmarks y no hay licencia de pesos que analizar (la etiqueta `mit` se aplica al repositorio, no a un modelo). La ficha que sigue documenta esta circunstancia de forma explícita y advierte sobre los riesgos de seguridad asociados a la distribución de ejecutables ofuscados con contraseña.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutor de scripts para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (etiqueta del repositorio; no hay licencia de pesos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio no publica configuración de transformer, MoE, SSM ni híbrida alguna, ni ficheros `config.json`, `tokenizer.json` o pesos. La model card describe exclusivamente un binario para Windows de 64 bits (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v2.1.7`, identificador `7D0DED909F`) que, según el texto, ofrece inyección de scripts en memoria, compatibilidad con la API Drawing y `hookmetamethod`, y un editor Monaco integrado.

Tampoco se documenta ningún proceso de entrenamiento: no hay número de tokens, composición de dataset, RLHF, DPO ni ninguna otra fase de alineamiento. La única información "técnica" disponible son afirmaciones de rendimiento del propio binario (polling a 338 Hz, respuesta en menos de 8 ms, cinco hilos de trabajo), que no son verificables con la información proporcionada y que no corresponden a métricas de un modelo de lenguaje.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling en el sentido de un LLM.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El multilingüismo indicado en los metadatos (14 idiomas) corresponde a las etiquetas del repositorio, no a capacidades lingüísticas verificadas de un modelo.
- Las capacidades descritas son de naturaleza totalmente distinta: ejecución de scripts en memoria, compatibilidad sUNC, editor Monaco, auto-ejecución y conexión multi-instancia.

## Casos de uso

- **Ninguno como modelo de IA.** No es posible emplear este repositorio para inferencia, generación de texto, RAG, agentes o cualquier tarea de procesamiento de lenguaje natural, porque no contiene pesos ni código de modelo.
- **Auditoría de seguridad defensiva:** un equipo de seguridad podría analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar si el ejecutable realiza acciones maliciosas, dado que se distribuye comprimido con contraseña y se solicita ejecutarlo como administrador.
- **Estudio de patrones de distribución sospechosos:** el repositorio es un caso ilustrativo de *typosquatting* de categoría en Hugging Face (publicar software de terceros bajo la apariencia de un modelo), útil para formar a revisores de *supply chain*.
- **Documentación de políticas de plataforma:** sirve como ejemplo para justificar filtros de moderación que detecten repositorios sin artefactos de modelo y con enlaces a ejecutables externos.
- **Formación en higiene de dependencias:** puede usarse en talleres internos para mostrar por qué no deben descargarse ZIP con contraseña desde enlaces a *releases* de cuentas desconocidas.
- **Verificación de metadatos:** útil para comprobar cómo las etiquetas (`windows`, `portable`, `x64`) y los idiomas declarados pueden no guardar relación con el contenido real del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos, y las cifras que aparecen en la model card (98 % de compatibilidad sUNC, 338 Hz, menos de 8 ms) son afirmaciones del autor sobre el binario, no resultados reproducibles de un modelo.

## Requisitos de hardware

- **VRAM estimada:** no aplica; no hay modelo que cargar en GPU.
- **GPU recomendadas:** no aplica.
- **Compatibilidad con GPU de consumo:** no aplica.
- **Requisitos declarados por el autor:** Windows 10 u 11 de 64 bits, ejecución como administrador y 4,8 MB de espacio para el archivo ZIP.
- **Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI):** no aplica; el artefacto es un ejecutable de Windows, no un modelo servible por estos *runtimes*.
- **Latencia y throughput:** no disponible para inferencia; las cifras de 338 Hz y 8 ms son declaraciones no verificadas sobre el ejecutable.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el repositorio no contiene un modelo. Frente a cualquier LLM open source real (por ejemplo, familias con pesos en safetensors y model card técnica), este repositorio carece de los elementos mínimos comparables: parámetros, contexto, licencia de pesos, benchmarks y artefactos de inferencia.

| Criterio | Este repositorio | Modelo open source típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors/GGUF) |
| Arquitectura declarada | No | Sí |
| Contexto | No disponible | Documentado |
| Benchmarks | No | Habitualmente publicados |
| Artefacto distribuido | ZIP con `.exe` y contraseña | Ficheros de pesos y tokenizador |
| Evaluable como modelo | No | Sí |

## Limitaciones y advertencias

- **No es un modelo de IA:** no puede usarse para inferencia, fine-tuning ni evaluación de capacidades lingüísticas.
- **Riesgo de seguridad elevado:** se distribuye un ejecutable de Windows comprimido con contraseña (`2026`) y se indica ejecutarlo como administrador; este patrón es habitual en campañas de *malware* y evita el análisis automático de antivirus.
- **Enlaces externos a GitHub Releases de terceros:** el binario no se aloja en Hugging Face, sino en cuentas de GitHub ajenas al repositorio, lo que impide verificar procedencia e integridad.
- **Suplantación de categoría:** el repositorio ocupa el espacio de modelos pese a no contener ninguno, lo que puede inducir a error a herramientas de descubrimiento automático.
- **Licencia:** la etiqueta MIT afecta al repositorio, no a un conjunto de pesos; no hay licencia de modelo que analizar para uso comercial.
- **Sesgos y alucinación:** no aplica en el sentido de un LLM, pero la model card contiene afirmaciones no verificables (descargas de 743 K, compatibilidad del 98 %) que no se corresponden con las 0 descargas registradas por Hugging Face.
- **Recomendación:** no descargar ni ejecutar el binario; si se requiere análisis, hacerlo en una máquina virtual sin red y con privilegios mínimos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OSAMAZAMIL/velocity-executor-keyless-pc-v2
- Enlace de descarga citado en la model card (GitHub Releases de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace a releases citado en la model card: https://github.com/zrodrigues8143/velocity-executor-keyless-pc-v2/releases/latest
- Paper, blog o demo oficial: no disponible
