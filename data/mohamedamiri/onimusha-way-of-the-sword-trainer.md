# MohamedAmiri/onimusha-way-of-the-sword-trainer

## Resumen

El repositorio `MohamedAmiri/onimusha-way-of-the-sword-trainer` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete de software para Windows etiquetado como "trainer" (herramienta de modificación o trampas) para el videojuego *Onimusha: Way of the Sword*. La model card describe un ejecutable portable de 64 bits, un archivo ZIP de 4,8 MB protegido con contraseña y una serie de supuestas funciones de superposición (overlay) y automatización de entrada.

El contenido no presenta arquitectura de red neuronal, parámetros, ventana de contexto, datos de entrenamiento ni pesos en formatos como safetensors o GGUF. Los metadatos de Hugging Face reflejan etiquetas propias de una distribución de software para escritorio (`windows`, `windows-11`, `x64`, `portable`), no de un modelo fundacional o ajustado.

Por tanto, esta ficha documenta la ausencia de un modelo de IA real y advierte de los riesgos asociados al contenido: enlaces de descarga a ejecutables de terceros, contraseñas de descompresión y referencias cruzadas a nombres de archivo de otro producto distinto (*Kingdom Come: Deliverance 2*), lo que resulta incoherente y sospechoso desde el punto de vista de la seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un ejecutable `.exe` y un `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card describe un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` (build `v2.0.6`, identificador `FE9AE98C8E`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. Las funciones enumeradas (overlay externo a 144 Hz, cajas 2D/3D, esqueletos, ESP de distancia, suavizado de entrada Bézier, escáner dinámico de offsets, capa de render resistente a captura de pantalla y núcleo externo en modo usuario) corresponden a técnicas de modificación de procesos en memoria en Windows, no a un pipeline de entrenamiento de machine learning.

No se documentan tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación de modelado. La nomenclatura mezcla el título *Onimusha: Way of the Sword* con nombres de archivo de *Kingdom Come: Deliverance 2*, lo que sugiere una plantilla reutilizada o un señuelo.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son etiquetas de metadatos.
- El artefacto descrito afirma incluir: overlay externo, ESP de distancia, suavizado de entrada y escáner de offsets para un videojuego concreto.
- No es un modelo desplegable mediante vLLM, llama.cpp, Ollama o TGI.

## Casos de uso

- Ninguno relacionado con IA generativa: el repositorio no contiene pesos ni código de inferencia.
- Auditoría de seguridad: revisar el binario en un entorno aislado para detectar comportamiento malicioso antes de cualquier ejecución.
- Análisis de model cards engañosas: usar este caso como ejemplo de etiquetado incorrecto en Hugging Face (tags de modelo frente a contenido de software).
- Investigación de spam y SEO abusivo en plataformas de modelos: documentar patrones de repositorios con enlaces a ejecutables y contraseñas.
- Formación en higiene de cadena de suministro: ilustrar por qué no deben ejecutarse binarios descargados de repositorios no verificados.
- No se recomienda ningún uso práctico del artefacto en producción ni en equipos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes).
- Latencia y throughput: la model card afirma una respuesta inferior a 21 ms y un overlay a 144 Hz o más, pero son cifras no verificables y sin metodología.

## Comparativa con modelos similares

| Producto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MohamedAmiri/onimusha-way-of-the-sword-trainer` | Ejecutable para Windows (no IA) | no disponible | no disponible | MIT (declarada) | Hugging Face, 0 descargas |
| Modelo de lenguaje open source (categoría general) | Modelo de IA | variable | variable | variable | Repositorios de modelos |
| Herramienta de modificación de juegos legítima | Software de escritorio | no aplica | no aplica | variable | Distribución oficial |

No existe un modelo de IA comparable porque el artefacto no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- Riesgo de seguridad alto: la model card enlaza a un ejecutable alojado en GitHub con contraseña de descompresión, un patrón habitual en campañas de malware.
- Incoherencia de nombres: el título menciona *Onimusha* mientras los archivos hacen referencia a *Kingdom Come: Deliverance 2*.
- Sin verificación de integridad: no se ofrecen hashes, firmas ni análisis de reputación del binario.
- Licencia MIT declarada, pero aplicable a un artefacto cuyo contenido real no está auditado; no confiere garantías de seguridad.
- Uso potencialmente contrario a los términos de servicio del videojuego y a la legislación sobre modificación de software.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- No debe ejecutarse en sistemas con datos sensibles ni con privilegios de administrador, pese a que la model card lo solicita explícitamente.

## Enlaces

- Hugging Face: https://huggingface.co/MohamedAmiri/onimusha-way-of-the-sword-trainer
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card (no verificado): https://github.com/manuel36415/onimusha-way-of-the-sword-trainer/releases/latest
