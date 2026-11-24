# mtastan/kingdom-come-deliverance-2-trainer-portabl

## Resumen

El repositorio `mtastan/kingdom-come-deliverance-2-trainer-portabl` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits distribuido a traves de la plataforma, etiquetado como "trainer portable" para el videojuego *Kingdom Come: Deliverance 2*. El contenido de la model card describe un supuesto menu de trucos (cheat mod menu) con overlays, escaneres de offsets y perfiles JSON, empaquetado en un archivo ZIP de 4,8 MB protegido con contrasena.

El artefacto no presenta pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los campos habituales de un modelo (parametros, contexto, cuantizacion) no existen en este repositorio. La metadata de Hugging Face incluye etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que corresponden a la interfaz del programa, no a capacidades linguisticas de un modelo.

Es relevante advertir que la model card contiene patrones tipicos de distribucion de software potencialmente malicioso: enlaces de descarga que apuntan a repositorios de GitHub de terceros distintos del autor declarado, contrasena fija para descomprimir el archivo, instrucciones para ejecutar un binario como administrador y afirmaciones no verificables de descargas y valoraciones. Esta ficha se limita a documentar el contenido tal como aparece, sin avalar su ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la interfaz del programa) |
| Licencia | MIT (segun metadata del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |
| Plataforma objetivo | Windows 10 / 11 de 64 bits |
| Build declarado | v2.9.4 (F8D154) |
| Tamano del archivo | 4,8 MB (ZIP) |
| Contrasena del archivo | 2026 (declarada en la model card) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni codigo de inferencia. La model card describe un programa externo en modo usuario ("user-mode external core") con overlay 2D/3D, escaner dinamico de offsets, suavizado de entrada Bezier y perfiles JSON intercambiables en caliente. No hay informacion sobre datos de entrenamiento, proceso de alineacion (RLHF/DPO) ni innovaciones en arquitectura de redes neuronales, porque el artefacto no es una red neuronal.

La unica "arquitectura" documentada es la de un ejecutable de Windows que, segun el autor, se ejecuta como administrador y utiliza Desktop Duplication para renderizar un overlay. No se aporta codigo fuente, hash de verificacion ni firma digital del binario.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues en el sentido de un modelo; las etiquetas de idioma corresponden a la localizacion de la interfaz del programa.
- El artefacto declara funcionalidades de menu de trucos para un videojuego: overlay, ESP, perfiles JSON, panic key (`END`), escaner de offsets y suavizado de entrada.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, porque no lo es.
- Uso potencial declarado por el autor: modificacion de la experiencia de juego en *Kingdom Come: Deliverance 2* mediante un menu de trucos en Windows, algo que puede contravenir los terminos de servicio del juego y las politicas de las plataformas.
- Auditoria de seguridad: analisis estatico y dinamico del binario en un entorno aislado para determinar su comportamiento real, dado que la model card no aporta hashes ni firma.
- Documentacion de patrones de distribucion sospechosos: el repositorio sirve como ejemplo de model card de Hugging Face que no describe un modelo y que incluye enlaces a terceros, contrasena fija y ejecucion como administrador.
- No se recomienda su despliegue en entornos de produccion, investigacion ni desarrollo de software.
- No se recomienda su ejecucion en equipos personales ni corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento del programa (respuesta en menos de 22 ms, 15 hilos de trabajo, menos de 33 MB de RAM) que no son verificables ni comparables con benchmarks de modelos de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits.
- VRAM: no aplica (no es un modelo de IA).
- GPU recomendadas: no disponible; el autor no especifica requisitos graficos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: el autor declara respuesta inferior a 22 ms y uso de RAM inferior a 33 MB, sin metodologia de medicion ni verificacion independiente.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable, ya que el artefacto es un ejecutable para Windows. Como referencia de contraste:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mtastan/kingdom-come-deliverance-2-trainer-portabl` | Ejecutable Windows x64 (ZIP) | no aplica | no aplica | MIT (declarada) | Hugging Face, 0 descargas |
| Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Red neuronal transformer | Miles de millones | Miles de tokens | Licencias especificas (Apache 2.0, Llama, etc.) | Hugging Face, amplia adopcion |
| Modelo de vision-lenguaje open source (p. ej. familia LLaVA, Qwen-VL) | Transformer multimodal | Miles de millones | Miles de tokens | Apache 2.0 u otras | Hugging Face |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha se limita a documentar el artefacto tal como aparece.
- La model card incluye enlaces de descarga que apuntan a repositorios de GitHub de terceros (`Shuji50/rob-run-cheat-mod-menu-pc`) distintos del autor declarado (`mtastan`), lo que impide verificar la cadena de custodia del binario.
- El archivo se distribuye protegido con contrasena fija (`2026`), practica habitual para evadir analisis automatizados de antivirus y plataformas.
- Se instruye al usuario a ejecutar el binario como administrador, lo que amplia el impacto de cualquier comportamiento malicioso.
- No se proporcionan hashes, firmas digitales ni codigo fuente del ejecutable.
- Las cifras de descargas (751K+) y valoracion (4,8/5) de la model card no son verificables y no coinciden con las metricas reales del repositorio en Hugging Face (0 descargas, 0 likes).
- El uso de trainers o cheats en videojuegos puede contravenir los terminos de servicio del juego y de las plataformas, con riesgo de sanciones en la cuenta.
- No se recomienda su ejecucion en entornos de produccion, investigacion ni desarrollo.
- La licencia MIT declarada cubre el repositorio, pero no aclara la procedencia ni los derechos del binario distribuido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mtastan/kingdom-come-deliverance-2-trainer-portabl
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/Shuji50/rob-run-cheat-mod-menu-pc
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/raul32935/kingdom-come-deliverance-2-trainer-portable
- Paper: no disponible
- Blog o demo oficial: no disponible
