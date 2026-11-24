# kyrylo1808/pet-simulator-99-script

## Resumen

El artefacto publicado bajo el identificador `kyrylo1808/pet-simulator-99-script` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (un archivo `.exe` distribuido dentro de un `.zip` de 8,9 MB) que se presenta como un "script" para el videojuego Pet Simulator 99, con funciones declaradas de teletransporte por coordenadas, automatización de granjas, ESP de entidades y salto entre servidores.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, pesos ni proceso de entrenamiento. El repositorio no declara pipeline de Hugging Face, no tiene descargas ni interacciones, y su model card es en realidad una página de descarga con enlaces a un repositorio externo de GitHub (`frame562/pet-simulator-99-script`), contraseña de descompresión y un ejecutable que solicita permisos de administrador.

Desde la perspectiva de evaluación de modelos, este artefacto queda fuera de cualquier comparativa técnica de IA. Lo relevante aquí es advertir de que su patrón de distribución (binario cerrado, contraseña en el archivo comprimido, ejecución como administrador, enlaces a un tercero ajeno al autor declarado) coincide con el de campañas habituales de malware. No debe descargarse ni ejecutarse en entornos de desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (se distribuye como `.zip` con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El artefacto no contiene pesos, configuración de transformer, dataset ni proceso de alineación. La model card describe funciones de un programa de automatización de un videojuego (teletransporte, anti-AFK, ESP, bucle de farmeo, optimizador de framerate, salto de servidor) con métricas de rendimiento inventariadas en la propia ficha del autor (por ejemplo, "131 Hz polling" o "98,5 % de consistencia"), sin ninguna evidencia verificable ni metodología reproducible.

No hay información sobre datos de entrenamiento, número de tokens, RLHF, DPO ni innovaciones técnicas de inferencia. Cualquier afirmación de rendimiento procede exclusivamente del texto promocional del autor.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las funciones que declara son de automatización de un cliente de videojuego en Windows: teletransporte por coordenadas, guardia anti-AFK, ESP de entidades y cofres, bucle de farmeo automatizado, optimizador de framerate y cambio de servidor.
- Multilingüismo: las etiquetas de idioma del repositorio no implican capacidades lingüísticas del binario; no hay evidencia de soporte real de idiomas.

## Casos de uso

No se identifican casos de uso legítimos para desarrolladores o investigadores de IA. El artefacto no es desplegable como modelo y su naturaleza (binario cerrado con contraseña y ejecución como administrador) desaconseja cualquier uso. A modo de contexto, lo que el autor declara que hace el programa es:

- Automatización de tareas repetitivas dentro de Pet Simulator 99 (farmeo de cofres y jefes), según la model card.
- Teletransporte entre islas, NPC y salas de raid mediante coordenadas.
- Mantenimiento de sesión activa con un pulso de entrada virtual contra el kick por inactividad.
- Visualización de entidades y cofres a través de paredes (ESP).
- Reducción de carga gráfica mediante eliminación de partículas.
- Cambio automático de instancia de servidor para buscar apariciones raras.

Ninguno de estos usos es una aplicación de IA y varios de ellos pueden contravenir los términos de servicio del videojuego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (consistencia del 98,5 %, 96,8 %, 98,6 %, sondeos a 131 Hz y 362 Hz, latencia inferior a 34 ms) son afirmaciones del autor sin metodología, conjunto de prueba ni comparación con alternativas, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad declarada: Windows 10/11 de 64 bits sobre procesadores Intel y AMD x64.
- Tamaño del paquete: 8,9 MB (archivo `.zip`), con un ejecutable interno `pet-simulator-99-script-v1.2.0-win64.exe`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a un LLM open source real, la comparación sería categóricamente inválida en parámetros, contexto, licencia de pesos y disponibilidad de formatos (safetensors, GGUF).

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni citarse como tal en comparativas de modelos.
- Patrón de distribución de alto riesgo: binario cerrado, archivo comprimido protegido con contraseña (`2026`), instrucción de ejecutar como administrador y enlaces de descarga alojados en un repositorio de GitHub de un tercero (`frame562`) distinto del autor declarado en Hugging Face.
- Posible malware: la combinación de ejecutable, contraseña y privilegios elevados es habitual en campañas de troyanos y stealers. No se debe descargar, extraer ni ejecutar.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre el contenido del binario ni sobre su procedencia.
- Las etiquetas de idioma no implican capacidades multilingües reales.
- Uso potencialmente contrario a los términos de servicio de Pet Simulator 99.
- Cero descargas y cero interacciones en Hugging Face: sin validación por parte de la comunidad.
- Riesgo de suplantación: el identificador del repositorio y el repositorio de descargas no coinciden en autoría.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kyrylo1808/pet-simulator-99-script
- Repositorio de descargas citado en la model card (no verificado, no recomendado): https://github.com/frame562/pet-simulator-99-script
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información disponible.
