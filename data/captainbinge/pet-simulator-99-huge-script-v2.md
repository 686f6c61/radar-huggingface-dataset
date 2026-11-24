# CaptainBinge/pet-simulator-99-huge-script-v2

## Resumen

El identificador `CaptainBinge/pet-simulator-99-huge-script-v2` no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable para Windows (un "script" o "trainer" orientado al videojuego Pet Simulator 99) empaquetado en un archivo ZIP protegido con contraseña. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, visión o multimodal.

La model card publicada por el autor reproduce un patrón habitual de distribución de software potencialmente malicioso: badges con valoraciones y cifras de descargas no verificables, instrucciones para desactivar o sortear alertas de Windows Defender y SmartScreen, un binario `.exe` que debe ejecutarse "como administrador" y un archivo comprimido con contraseña fija (`2026`) que impide el análisis previo por parte de antivirus y motores de inspección. Los enlaces de descarga apuntan a releases de GitHub de terceros ajenos al titular del repositorio.

Por todo ello, esta ficha no puede documentar especificaciones técnicas de un modelo, sino que debe advertir de que el artefacto no es un modelo de IA y de los riesgos de seguridad asociados a su descarga y ejecución. No se dispone de información sobre arquitectura, parámetros, contexto ni licencia de uso de pesos, porque no existen tales pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de idioma del repositorio no implican capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El contenido del repositorio es un binario Windows (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, build `v4.3.7`, identificador `05D803`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card describe módulos funcionales orientados a la manipulación del cliente del videojuego (anti-AFK, bucles de farmeo automatizado, ESP de entidades, salto entre servidores, teleport por coordenadas y configuración JSON persistente), ninguno de los cuales constituye una innovación en aprendizaje automático.

Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen la plataforma de ejecución del binario, no características de un modelo. La presencia de etiquetas de idioma (`en`, `ru`, `zh`, `es`, etc.) es un artefacto de la plantilla de metadatos de Hugging Face y no implica soporte multilingüe real de ningún sistema generativo.

## Capacidades

- No es un modelo generativo: no produce texto, código, imágenes ni audio.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni modos de "pensamiento".
- No tiene capacidades multilingües verificables; los tags de idioma del repositorio no acreditan nada.
- El binario declara funcionalidades de automatización y manipulación del cliente del videojuego Pet Simulator 99 (anti-AFK, farmeo, ESP, teleport, server hopping).
- No se ha publicado documentación técnica, código fuente ni análisis independiente del binario.

## Casos de uso

- No aplica. El artefacto no es un modelo de IA y no tiene casos de uso legítimos en desarrollo de software, investigación o producción.
- Uso educativo en análisis de malware: el repositorio puede servir como muestra para estudiar patrones de ingeniería social en model cards (contraseñas fijas en ZIP, badges falsos, instrucciones para sortear SmartScreen).
- Auditoría de cadena de suministro: útil como ejemplo de repositorio de Hugging Face que no contiene un modelo y que redirige a releases de GitHub de terceros.
- Formación en ciberseguridad: caso práctico de por qué no deben ejecutarse binarios descargados de repositorios no verificados con privilegios de administrador.
- No se recomienda su uso para automatizar el videojuego: infringiría con alta probabilidad los términos de servicio de la plataforma y podría conllevar el bloqueo de la cuenta.
- No se recomienda su ejecución en entornos personales ni corporativos por el riesgo de compromiso del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningún tipo, y las cifras de "Rating 5.0/5" y "70K+ downloads" que aparecen en la model card son badges estáticos sin verificación.

## Requisitos de hardware

- No aplica en el sentido de VRAM o GPU: el artefacto es un ejecutable de Windows x64, no un modelo de inferencia.
- Plataforma declarada: Windows 10 u 11 de 64 bits sobre procesadores Intel o AMD x64.
- No requiere GPU, VRAM ni aceleradores; el consumo de recursos del binario no está documentado.
- No es desplegable con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia.
- No se dispone de datos de latencia ni throughput porque no hay inferencia de modelo implicada.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería improcedente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha se limita a documentar ese hecho y los riesgos asociados.
- El binario se distribuye comprimido con contraseña fija (`2026`), lo que impide el escaneo previo por motores antivirus y es un patrón habitual en campañas de distribución de malware.
- La model card instruye explícitamente a ejecutar el `.exe` "como administrador" y ofrece indicaciones para gestionar alertas de Windows Defender y SmartScreen, lo que incrementa el riesgo de compromiso del sistema.
- Los enlaces de descarga apuntan a releases de GitHub de cuentas de terceros (`Shuhua73716`, `QaqumaYak29`) no vinculadas al titular del repositorio en Hugging Face.
- Las cifras de descargas, valoración y tamaño que aparecen en la model card no son verificables y no deben tomarse como indicadores de confianza.
- El uso de este tipo de software en Pet Simulator 99 contraviene con alta probabilidad los términos de servicio de la plataforma y puede suponer el bloqueo permanente de la cuenta.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del binario ni sobre su comportamiento en ejecución.
- No se han identificado análisis de seguridad independientes del artefacto; cualquier ejecución debe considerarse de riesgo alto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CaptainBinge/pet-simulator-99-huge-script-v2
- Release de GitHub referenciada en la model card (terceros, no verificada): https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en la model card (terceros, no verificado): https://github.com/QaqumaYak29/pet-simulator-99-huge-script-v2/releases/latest
