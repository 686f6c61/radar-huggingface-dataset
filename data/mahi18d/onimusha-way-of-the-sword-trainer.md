# mahi18d/onimusha-way-of-the-sword-trainer

## Resumen

El artefacto publicado bajo el identificador `mahi18d/onimusha-way-of-the-sword-trainer` en Hugging Face no es un modelo de inteligencia artificial, sino un supuesto *trainer* (herramienta de trucos o modificación de partida) para el videojuego *Onimusha: Way of the Sword*, distribuido como ejecutable portable para Windows 10 y Windows 11 de 64 bits. El autor del repositorio es el usuario `mahi18d`, y la model card describe un binario denominado `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados al repositorio.

La ficha se redacta, por tanto, sobre un artefacto que no encaja en la categoría de modelo de lenguaje: no hay parámetros, no hay longitud de contexto, no hay datos de entrenamiento ni benchmarks. La información disponible se limita a metadatos de Hugging Face (etiquetas, licencia MIT, catorce idiomas declarados) y al contenido de la model card, que mezcla referencias a dos videojuegos distintos (*Onimusha: Way of the Sword* y *Kingdom Come: Deliverance 2*) y enlaza descargas alojadas en repositorios de GitHub de terceros.

La relevancia de esta ficha es fundamentalmente de advertencia: el patrón descrito (ZIP con contraseña, ejecutable que requiere permisos de administrador, enlaces de descarga externos a Hugging Face y afirmaciones de funcionalidad no verificables) es característico de campañas de distribución de software potencialmente malicioso. Cualquier evaluación técnica debe partir de esa premisa y no de la hipótesis de que se trata de un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin verificación funcional) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni código de entrenamiento. El contenido descrito en la model card es un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, etiquetado internamente como build `v2.0.6 (FE9AE9)` / `FE9AE98C8E`, junto con un archivo ZIP homónimo de 4,8 MB. La model card menciona módulos de superposición externa, suavizado de entrada Bézier, escáner de offsets dinámicos y una capa de renderizado "stream-proof", pero no aporta código fuente, especificación de formato ni documentación técnica verificable que respalde esas afirmaciones.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación en arquitectura de modelos. La única "arquitectura" identificable es la de una aplicación de escritorio Windows x64 que, según el texto, se ejecuta en modo usuario y utiliza Desktop Duplication para renderizar una superposición sin inyectar DLL en el proceso del juego.

## Capacidades

- No se trata de un modelo generativo: no produce texto, código, matemáticas ni análisis de imágenes.
- La model card declara funciones de superposición externa (cajas 2D/3D, esqueletos de huesos y ESP de distancia) sobre el juego objetivo.
- Declara suavizado de entrada configurable con radio de FOV y comprobación de visibilidad.
- Declara un escáner de offsets que resuelve firmas de punteros tras actualizaciones del juego.
- Declara una tecla de pánico (`END`) para descargar el proceso.
- Declara exclusión de captura de pantalla en OBS, ShadowPlay y Discord.
- No hay soporte de *tool calling*, *function calling*, razonamiento multi-paso ni modo *thinking*.
- El multilingüismo declarado (catorce idiomas) corresponde a etiquetas de metadatos, no a capacidades verificadas del binario.

## Casos de uso

- Ninguno recomendado en un contexto de desarrollo, investigación o producción de IA. El artefacto no es un modelo y no puede integrarse en pipelines de inferencia.
- Auditoría de seguridad: analizar el binario en un entorno aislado (máquina virtual sin red, sin credenciales) para determinar su comportamiento real antes de cualquier otra consideración.
- Estudio de patrones de distribución maliciosa: el repositorio sirve como ejemplo documentado de *model card* señuelo que mezcla nombres de dos videojuegos y redirige a descargas externas con contraseña.
- Formación en higiene de cadena de suministro: ilustra por qué no deben ejecutarse binarios obtenidos de repositorios de modelos sin verificación de firma ni análisis previo.
- Denuncia y notificación a la plataforma: los enlaces a GitHub de terceros y el ejecutable con contraseña son candidatos a reporte ante Hugging Face y GitHub.
- Referencia para políticas de bloqueo: las organizaciones pueden usar este caso para justificar reglas que impidan la descarga de artefactos no-modelo desde registros de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de ningún tipo, y las cifras que aparecen en la model card (por ejemplo, "98,7 % de consistencia" o "< 21 ms de tiempo de respuesta") son afirmaciones publicitarias sin metodología, sin conjunto de prueba y sin posibilidad de reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 (22H2) y Windows 11 (24H2), arquitectura x64.
- Espacio en disco: el ZIP ocupa 4,8 MB; el espacio descomprimido no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; son herramientas para servir modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Si se compara con otros *trainers* o herramientas de modificación de partidas, la información pública es insuficiente y heterogénea, y en ningún caso se dispone de datos verificables de rendimiento, seguridad o licencia para establecer una comparación rigurosa.

| Criterio | Este artefacto | Modelo de lenguaje típico |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Red neuronal con pesos |
| Parámetros | No disponible | Millones o miles de millones |
| Contexto | No aplica | Miles o cientos de miles de tokens |
| Licencia | MIT (declarada) | Variable (Apache-2.0, MIT, custom) |
| Despliegue | Ejecución local en Windows | vLLM, llama.cpp, TGI, Ollama |
| Verificabilidad | Nula (sin código ni firmas) | Alta (pesos y evaluaciones públicas) |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y pipeline. Cualquier expectativa de inferencia es infundada.
- Inconsistencia de nombres: el título menciona *Onimusha: Way of the Sword* pero el ejecutable y los enlaces se refieren a *Kingdom Come: Deliverance 2*. Es una señal de alarma sobre la procedencia del artefacto.
- Distribución con contraseña (`2026`) y ejecución como administrador: patrón habitual para evadir análisis automáticos y obtener privilegios elevados.
- Enlaces de descarga alojados en repositorios de GitHub de terceros, no en Hugging Face: rompe la cadena de custodia y dificulta la verificación de integridad.
- Sin firma digital, sin hash publicado, sin código fuente y sin compilación reproducible: imposible verificar qué contiene el binario.
- Riesgo de malware: un ejecutable que pide permisos de administrador y se distribuye cifrado en un ZIP puede instalar *malware*, *stealer* de credenciales o *ransomware*. No debe ejecutarse fuera de una máquina virtual aislada.
- Licencia MIT declarada pero sin archivo `LICENSE` verificable en la información proporcionada; además, la licencia del artefacto no cubre los derechos sobre los videojuegos mencionados.
- Uso comercial: no aplicable; el artefacto no tiene utilidad comercial legítima y su uso puede infringir los términos de servicio de los juegos y las leyes de propiedad intelectual.
- Idiomas declarados sin verificación: las catorce etiquetas de idioma no implican soporte real de localización en el binario.
- Cero descargas y cero *likes* en el momento de la consulta: sin evidencia de uso legítimo ni de comunidad que lo respalde.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mahi18d/onimusha-way-of-the-sword-trainer
- Model card del autor (contenido citado en esta ficha): incluida en la página anterior.
- Enlace de descarga referenciado en la model card (ZIP, contraseña `2026`): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado para la clave de extracción: https://github.com/manuel36415/onimusha-way-of-the-sword-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
