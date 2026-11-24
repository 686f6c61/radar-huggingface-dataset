# MichaelYanolja/inzoi-cheat-trainer-keyless

## Resumen

El repositorio `MichaelYanolja/inzoi-cheat-trainer-keyless` no contiene un modelo de inteligencia artificial, sino un artefacto empaquetado como un supuesto "cheat trainer" para el videojuego InZOI, distribuido como ejecutable portable para Windows de 64 bits. La model card describe un binario `inzoi-cheat-trainer-keyless-v1.2.0-win64.exe` (build `v3.2.6`, `B0E5C612D1`) comprimido en un archivo ZIP de 8,9 MB protegido con la contraseña `2026`, y enlaza su descarga a un repositorio de GitHub de terceros (`supachai8492/inzoi-cheat-trainer-keyless`). No existe ningún pipeline de inferencia, pesos, tokenizador ni configuración de arquitectura neuronal asociada al identificador.

Por tanto, esta ficha no puede documentar parámetros, contexto, cuantizaciones ni capacidades lingüísticas reales: esos campos figuran como "no disponible" porque el artefacto no es un modelo. El interés para desarrolladores e investigadores es distinto del habitual: se trata de un caso representativo de publicación abusiva en Hugging Face, con etiquetas de idioma y licencia MIT empleadas para mejorar el posicionamiento en búsquedas, y con un patrón de distribución (ZIP con contraseña, ejecutable "run as administrator", enlace externo a GitHub) que coincide con tácticas frecuentes de malware.

La relevancia ahora mismo es, por tanto, de seguridad y gobernanza de artefactos: ilustra por qué conviene verificar el tipo real de contenido antes de descargar y ejecutar nada alojado en un hub de modelos, y por qué las políticas de moderación de repositorios deben cubrir binarios ejecutables disfrazados de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | mit (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.exe` dentro de un `.zip` de 8,9 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. La model card describe componentes de un supuesto programa de trampas: un núcleo externo en modo usuario con renderizado mediante Desktop Duplication, un escáner dinámico de offsets, una capa de superposición ("overlay") a 144 Hz con cajas delimitadoras y esqueletos, un radar 2D con filtrado de botín y una tecla de pánico (`END`) para descargar el proceso. Se citan cifras como 11 hilos de trabajo, menos de 26 ms de latencia de respuesta y menos de 52 MB de RAM, pero no se aporta ninguna evidencia verificable ni código fuente que las respalde.

No se documentan datos de entrenamiento, tokens, composición de dataset ni técnicas de alineación (RLHF/DPO) porque no aplican. Tampoco hay innovación técnica verificable: los detalles descritos corresponden a técnicas conocidas de manipulación de memoria de procesos en videojuegos, no a investigación en IA.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma de los metadatos son etiquetas de indexación.
- El contenido declarado por el autor es un entrenador de trampas para InZOI con superposición externa, radar y tecla de pánico, sin verificación independiente.
- No se han publicado capacidades especiales (modo thinking, visión, audio) porque no existen en este artefacto.

## Casos de uso

- Auditoría de seguridad de artefactos en hubs de modelos: revisar metadatos, tamaño y tipo de fichero antes de descargar permite detectar publicaciones que no son modelos y evitar ejecutar binarios no verificados.
- Formación en higiene de cadena de suministro: usar este tipo de repositorio como ejemplo en talleres sobre riesgos de ejecutar `.exe` con privilegios de administrador obtenidos de enlaces externos.
- Diseño de políticas de moderación: servir de muestra para definir reglas que detecten ZIP con contraseña, ejecutables y redirecciones a GitHub en repositorios etiquetados como modelos.
- Investigación sobre spam y SEO abusivo en plataformas de modelos: analizar el uso de decenas de etiquetas de idioma y de una licencia permisiva para mejorar la visibilidad en búsquedas.
- Evaluación de riesgos legales: estudiar el encuadre de licencia MIT sobre software de trampas en videojuegos, que puede contravenir los términos de servicio del juego y la legislación aplicable.
- Concienciación de usuarios finales: documentar el patrón "descarga el ZIP, extrae con contraseña, ejecuta como administrador" como señal de alarma en materiales de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 26 ms de respuesta, 99,5 % de consistencia, 747K descargas, 99 % de valoraciones verificadas) son afirmaciones promocionales sin metodología ni evidencia, por lo que no se recogen como resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada por el autor: Windows de 64 bits (Windows 11 incluido), ejecución portable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable de Windows.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A modo de contraste categórico:

| Criterio | Este repositorio | Modelo de lenguaje típico |
|---|---|---|
| Contenido | Ejecutable `.exe` en ZIP de 8,9 MB | Pesos en safetensors/GGUF |
| Pipeline de inferencia | no disponible | text-generation, etc. |
| Parámetros y contexto | no disponibles | declarados en la model card |
| Evaluación reproducible | ninguna | benchmarks publicados |
| Riesgo de ejecución | alto (binario sin verificar) | bajo (datos, no código) |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido.
- Riesgo de seguridad alto: se solicita ejecutar un binario como administrador tras extraerlo con contraseña, un patrón habitual en campañas de malware.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero, no al propio hub, lo que impide verificar integridad y procedencia.
- Las etiquetas de idioma y la licencia MIT parecen empleadas para indexación y apariencia de legitimidad, no para describir el contenido.
- Las cifras de descargas, valoraciones y rendimiento de la model card no son verificables y deben tratarse como no fiables.
- Uso comercial: la licencia MIT se declara sobre el artefacto, pero su naturaleza (trampas para un videojuego) puede infringir los términos de servicio del juego y la normativa aplicable; no se recomienda su uso en producción ni su redistribución.
- Posible alucinación no aplica; el riesgo equivalente es la falsa representación del contenido del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MichaelYanolja/inzoi-cheat-trainer-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/supachai8492/inzoi-cheat-trainer-keyless
- Última release referenciada: https://github.com/supachai8492/inzoi-cheat-trainer-keyless/releases/latest
- Paper, blog o demo oficial: no disponible
