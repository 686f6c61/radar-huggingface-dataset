# Addex/days-gone-cheat-trainer

## Resumen

No existe un modelo de IA open source asociado al identificador `Addex/days-gone-cheat-trainer`. El repositorio de Hugging Face con ese nombre no contiene pesos de red neuronal, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: aloja un ejecutable de Windows presentado como "entrenador de trucos" (cheat trainer) para el videojuego Days Gone. La model card describe un binario `.exe` de 4,8 MB, distribuido en un ZIP protegido con contraseña, con módulos de overlay, radar 2D y filtrado de objetos del juego.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto, cuantizaciones ni capacidades lingüísticas, porque no hay ningún modelo que evaluar. Los campos técnicos habituales se marcan como "no disponible" y se detalla únicamente lo que la información proporcionada permite verificar. El interés para desarrolladores e investigadores es nulo desde el punto de vista de IA; el interés real es de seguridad, ya que el patrón de distribución (binario cerrado, contraseña en el propio README, enlaces a repositorios de terceros, instrucciones para desactivar avisos de SmartScreen) coincide con campañas habituales de malware.

Cabe señalar además que el contenido de la model card mezcla identificadores de dos juegos distintos (Days Gone e inZOI), usa nombres de fichero incoherentes con el proyecto y presenta insignias de "99 % verificado" sin ninguna fuente. Nada de ello es verificable ni constituye documentación técnica de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto es un ejecutable nativo para Windows de 64 bits que, según la model card, funciona en modo usuario ("user-mode external core") y renderiza mediante Desktop Duplication en lugar de inyectar DLL en el proceso del juego. La misma documentación menciona un overlay externo asíncrono, suavizado de entrada tipo Bézier, un radar 2D con filtro de botín y una capa de exclusión de captura para OBS, ShadowPlay y Discord.

No se proporciona ninguna información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni innovación algorítmica alguna, porque no aplica. Tampoco se documenta el proceso de compilación, las dependencias, el hash del binario ni la cadena de custodia del ejecutable, que son los datos que sí serían relevantes para auditar un binario de este tipo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multimodales de visión, audio o vídeo en el sentido de un modelo; el "overlay" descrito es una superposición gráfica sobre el juego.
- Las funciones declaradas son de manipulación de un videojuego: radar 2D, filtro de objetos por rareza, cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia.
- Incluye una tecla de pánico (`END`) que, según el autor, libera handles y termina el proceso en menos de 9 ms.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card plantea son todos de modificación de un videojuego concreto y conllevan riesgos técnicos y legales:

- Modificación de partidas de Days Gone en modo un jugador: el binario se ejecutaría junto al juego para alterar variables en memoria; no hay documentación técnica que permita evaluar su funcionamiento.
- Captura de pantalla con overlay: el autor describe exclusión de OBS, ShadowPlay y Discord, lo que en la práctica sirve para ocultar la superposición en grabaciones o emisiones.
- Automatización de entrada con suavizado Bézier: orientada a simular movimiento humano, un patrón habitual para evadir sistemas antitrampas.
- Distribución de software a través de repositorios de terceros: el ZIP se aloja en un repositorio de GitHub ajeno al proyecto y se protege con contraseña, lo que impide el análisis previo por parte de antivirus y filtros corporativos.
- Formación o investigación en IA: no aplica, al no existir modelo, pesos ni dataset.
- Evaluación de seguridad defensiva: el único uso razonable sería como muestra de estudio de técnicas de distribución de malware, siempre en entorno aislado y sin ejecutar el binario en equipos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (96,8 % y 96,5 % de "consistencia", menos de 27 MB y menos de 23 MB de RAM, menos de 9 ms de respuesta) son afirmaciones del autor sin metodología, sin conjunto de prueba y sin posibilidad de reproducción; no constituyen benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits, sobre procesadores Intel y AMD x64.
- Huella en disco del paquete: 4,8 MB comprimido.
- Memoria RAM declarada por el autor: menos de 27 MB y menos de 23 MB según el módulo, cifras no verificadas.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` que se ejecuta "como administrador".
- Latencia y throughput: no disponibles como métricas de inferencia.

## Comparativa con modelos similares

No disponible. No hay modelos de IA comparables porque el artefacto no es un modelo. Si se compara como software, los equivalentes serían utilidades de modificación de juegos de un solo jugador, para las que no se dispone de datos verificables en la información proporcionada.

| Criterio | Addex/days-gone-cheat-trainer | Modelo de IA open source típico |
|---|---|---|
| Naturaleza | Binario Windows x64 | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Reproducibilidad | Nula (sin código fuente ni hash) | Alta (configuración y tokenizador públicos) |
| Evaluación posible | No | Sí, mediante benchmarks estándar |
| Licencia | MIT declarada | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, código o razonamiento queda fuera de lugar.
- El binario se distribuye compilado, sin código fuente, sin hash público y dentro de un ZIP con contraseña, lo que impide el análisis estático previo por parte de antivirus y soluciones EDR.
- La model card instruye explícitamente a desactivar o ignorar avisos de Windows Defender y SmartScreen, un patrón habitual en la distribución de software malicioso.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros y los nombres de fichero mezclan dos juegos distintos (Days Gone e inZOI), lo que sugiere contenido copiado o reempaquetado.
- El uso de este tipo de utilidades puede infringir los términos de servicio del juego y, en determinadas jurisdicciones, la legislación sobre protección de software; además, ejecutarlo con privilegios de administrador amplía el impacto de cualquier carga maliciosa.
- Los idiomas declarados en los metadatos no implican soporte real de interfaz o de procesamiento lingüístico; no hay evidencia de localización.
- No se debe ejecutar en equipos de trabajo, servidores ni entornos con datos sensibles. Si se analiza por motivos de seguridad, hacerlo en una máquina virtual desechable y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addex/days-gone-cheat-trainer
- Repositorio de GitHub citado en la model card: https://github.com/Witthaya25172/days-gone-cheat-trainer
- Repositorio de GitHub de descarga citado en la model card: https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Papers, blogs, demos o documentación técnica del modelo: no disponible
