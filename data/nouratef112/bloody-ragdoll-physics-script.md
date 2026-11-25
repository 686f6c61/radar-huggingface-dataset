# NourAtef112/bloody-ragdoll-physics-script

## Resumen

El artefacto publicado bajo el identificador `NourAtef112/bloody-ragdoll-physics-script` no es un modelo de lenguaje ni un modelo de IA en sentido estricto. Se trata de un repositorio de Hugging Face cuyo contenido es una model card promocional que distribuye un ejecutable de Windows (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) presentado como "script de física ragdoll". La documentación interna describe módulos de overlay externo, ESP (detección de jugadores a través de paredes), aimbot con suavizado Bézier y capas anti-captura para OBS, ShadowPlay y Discord, lo que sitúa el artefacto en la categoría de software de trampas para videojuegos, no en la de un modelo fundacional.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (14 códigos ISO) corresponden a la metadata de la model card, no a capacidades lingüísticas de un modelo. El pipeline aparece como "no disponible" y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

Por tanto, esta ficha documenta el artefacto tal como está publicado y advierte de que no debe evaluarse como un modelo de IA open source. Cualquier uso en producción requeriría, en primer lugar, verificar la naturaleza real del binario y, en segundo lugar, asumir los riesgos legales y de seguridad asociados a la distribución de ejecutables sin cadena de custodia ni firma de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadata, no verificados como capacidades del artefacto) |
| Licencia | MIT (declarada en la model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red, tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF, DPO) porque el artefacto no es un modelo entrenado. La model card describe, en su lugar, un conjunto de módulos de software para Windows: un escáner dinámico de offsets con resolución automática de firmas de punteros, un overlay externo a 144 Hz con cajas 2D/3D y esqueletos de huesos, un sistema de suavizado de entrada Bézier con radio de FOV configurable y VisCheck, una capa de render "stream-proof" que excluye la captura en OBS, ShadowPlay y Discord, y perfiles JSON intercambiables en caliente con tecla de pánico `END`.

Los datos citados en la model card (build `v2.5.5 (227BC5)`, 4,8 MB, contraseña de archivo `2026`, RAM `< 62 MB`, latencias `< 25 ms` y `< 27 ms`) son afirmaciones del autor no verificables de forma independiente a partir de la información disponible. No hay paper, repositorio de código fuente, ni artefactos de evaluación que respalden estas cifras.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües verificadas; los 14 idiomas son metadata de la model card.
- No incluye visión, audio ni modo "thinking".
- El binario descrito en la model card implementa, según el autor, overlay externo, ESP, aimbot con suavizado y exclusión de captura de pantalla, funciones propias de software de trampas para videojuegos.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA open source, porque el artefacto no es un modelo.
- Evaluación de seguridad de artefactos: un analista podría inspeccionar el ZIP en un entorno aislado para caracterizar el binario y documentar indicadores de compromiso, sin ejecutarlo en producción.
- Investigación de malware y trampas: estudiar la estructura de la model card como ejemplo de ingeniería social (badges falsos de descargas, contraseña de archivo, enlaces a releases de terceros).
- Docencia sobre riesgos de la cadena de suministro: usar el caso como ejemplo de por qué no deben ejecutarse binarios descargados desde model cards sin firma ni verificación de hash.
- Moderación de plataformas: identificar patrones de publicación (tags de Windows, badges de rating, enlaces a GitHub ajenos al autor) para mejorar los filtros de detección en hubs de modelos.
- Auditoría de licencias: comprobar la discrepancia entre una licencia MIT declarada y la ausencia de código fuente que la respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (97,3 %, 97,6 %, 97,9 % de "consistencia", RAM `< 62 MB`, latencias `< 25 ms` y `< 27 ms`) son afirmaciones del autor sin metodología, conjunto de evaluación ni reproducibilidad, por lo que no se recogen como benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no es un modelo neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Almacenamiento: 4,8 MB según el autor; requiere 7-Zip o WinRAR para extraer con contraseña `2026`.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Si se compara como software, la categoría equivalente sería la de utilidades de trampas para videojuegos, para las que no se ofrece comparativa por razones legales y de seguridad.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA; evaluarlo como tal llevaría a conclusiones erróneas.
- La model card incluye enlaces a releases de GitHub de terceros (`Shuhua73716/robrun-trainer-esp-aimbot-2026`) distintos del autor declarado, lo que constituye un indicio de cadena de suministro no confiable.
- El binario se distribuye comprimido con contraseña, práctica habitual para evadir análisis automáticos de antivirus y sandboxes.
- La model card incluye una sección de FAQ que anticipa alertas de Windows Defender y SmartScreen, lo que sugiere detecciones por parte de motores antimalware.
- Riesgo elevado de malware: ejecutar un `.exe` sin firma de código, sin hash publicado y sin código fuente verificable expone al usuario a robo de credenciales, persistencia y exfiltración.
- La licencia MIT declarada no cubre el binario en la práctica: sin código fuente no hay forma de ejercer los derechos que la licencia concede.
- Uso en producción desaconsejado en cualquier escenario; el uso de software de trampas en videojuegos puede vulnerar los términos de servicio de las plataformas y la legislación de algunos países.
- Los idiomas declarados no implican capacidades multilingües del artefacto.
- No hay sesgos medibles porque no hay modelo; el "sesgo" relevante es el de la propia model card, diseñada para parecer un proyecto con tracción (badges de 120K+ descargas y rating 5.0/5) cuando el repositorio registra 0 descargas y 0 likes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NourAtef112/bloody-ragdoll-physics-script
- Release de terceros citada en la model card: https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado como origen: https://github.com/janalvarez166/bloody-ragdoll-physics-script/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
