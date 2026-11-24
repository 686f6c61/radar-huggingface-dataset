# Marselox/escape-from-tarkov-radar-esp-win11

## Resumen

El artefacto publicado bajo el identificador `Marselox/escape-from-tarkov-radar-esp-win11` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete binario para Windows x64 (build `v3.7.5`, código `96A3FC`) distribuido como archivo ZIP de 8,9 MB con contraseña de extracción, cuyo contenido declarado es un ejecutable de tipo *cheat* (radar/ESP) para el videojuego *Escape From Tarkov*. El repositorio de Hugging Face actúa únicamente como espejo de distribución, no como alojamiento de pesos de red neuronal.

La model card describe módulos de superposición externa a 144 Hz, escaneo dinámico de offsets, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para descarga del proceso. No se declara arquitectura de red, número de parámetros, longitud de contexto, tokenizador, dataset de entrenamiento ni ningún artefacto propio de un modelo (safetensors, GGUF, etc.). Los campos de la ficha que dependen de esas propiedades se marcan como no disponibles.

Es relevante advertir que la distribución de este tipo de software conlleva riesgos técnicos y legales: ejecutables ofuscados con contraseña, instrucciones para desactivar la detección de Windows Defender y ejecución como administrador. Además, su uso en *Escape From Tarkov* viola los términos de servicio del juego y puede acarrear el baneo de la cuenta. La ficha se limita a documentar lo declarado, sin validar ni recomendar su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; ejecutable nativo Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no implica capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo entrenado. Según la model card, el paquete contiene un ejecutable (`escape-from-tarkov-radar-esp-win11-v1.2.0-win64.exe`) que opera en modo usuario, sin hooks DLL internos, usando Desktop Duplication para el renderizado de la superposición. Se mencionan componentes como un escáner de offsets con resolución automática de firmas tras parches del juego, suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, y un núcleo sin bloqueos con 15 hilos de trabajo.

No se declara ningún proceso de entrenamiento, dataset, RLHF, DPO ni innovación algorítmica propia de modelos generativos. Cualquier afirmación sobre arquitectura transformer, MoE o SSM es inaplicable a este artefacto.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni produce código.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües derivadas de un modelo; los códigos de idioma del repo son metadatos de descubrimiento.
- Función declarada: superposición externa (radar/ESP) sobre el proceso del juego *Escape From Tarkov*, con cajas 2D/3D, esqueletos de huesos y distancia.
- Perfiles JSON intercambiables con una tecla (presets Legit, Visual, Custom).
- Tecla de pánico `END` para liberar handles y salir del proceso.

## Casos de uso

- No se identifican casos de uso legítimos de IA, desarrollo o investigación para este artefacto.
- Uso declarado por el autor: asistencia visual no autorizada en *Escape From Tarkov*, lo que infringe los términos de servicio del juego y puede provocar el baneo permanente de la cuenta.
- Auditoría de seguridad defensiva: un analista podría inspeccionar el binario en un entorno aislado para estudiar técnicas de evasión (ofuscación, contraseña en ZIP, instrucciones para desactivar Defender), sin ejecutarlo en producción.
- Investigación de malware: el patrón de distribución (ZIP con contraseña, ejecutable como administrador, avisos para desactivar antivirus) es coherente con campañas de *droppers*; sirve como muestra para formación en detección.
- Docencia sobre riesgos de cadena de suministro: ejemplo de repositorio de Hugging Face usado como espejo de binarios ajenos al ecosistema de modelos.
- No se recomienda su despliegue en ningún entorno operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas internas del ejecutable (superposición a 144 Hz, sondeo a 222 Hz, respuesta del escáner de offsets en menos de 19 ms, uso de RAM inferior a 37 MB, 15 hilos de trabajo, consistencia del 96,1 % en la descarga por tecla de pánico), pero no son benchmarks de modelos ni comparables con MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Sistema operativo: Windows 10 22H2 o Windows 11 24H2, 64 bits.
- RAM declarada por el ejecutable: menos de 37 MB en modo usuario.
- Tamaño del paquete: 8,9 MB (ZIP); requiere 7-Zip o WinRAR y contraseña `2026` para extraer.
- Ejecución declarada: como administrador.
- GPU: no aplica (no hay inferencia de red neuronal).
- VRAM: no disponible / no aplica.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplican.
- Latencia y throughput: no disponibles como métricas de modelo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los paquetes de *cheats* para videojuegos no se comparan por parámetros, contexto ni licencia de pesos, sino por vectores de detección antivirus, ofuscación y compatibilidad con parches del juego, datos que no se han publicado aquí.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni citarse como tal en comparativas de LLM.
- Riesgo de seguridad elevado: ejecutable ofuscado con contraseña, instrucciones explícitas para desactivar Windows Defender/SmartScreen y ejecución como administrador.
- Posible contenido malicioso no verificado: el patrón de distribución es habitual en *droppers* y *stealers*; no se ha auditado el binario.
- Riesgo legal y de cuenta: el uso en *Escape From Tarkov* viola los términos de servicio y puede suponer baneo permanente; en algunas jurisdicciones la distribución de *cheats* tiene implicaciones legales.
- Licencia MIT declarada en metadatos, pero sin verificación de titularidad ni de los binarios incluidos; la licencia no cubre necesariamente el ejecutable de terceros.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación comunitaria.
- Idiomas listados en metadatos sin respaldo funcional.
- No usar en producción, entornos corporativos ni máquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/escape-from-tarkov-radar-esp-win11
- Repositorio GitHub referenciado en la model card: https://github.com/LanSantos971/escape-from-tarkov-radar-esp-win11
- Releases del proyecto referenciado: https://github.com/LanSantos971/escape-from-tarkov-radar-esp-win11/releases/latest
- Descarga directa citada en la model card (no verificada): https://github.com/LanSantos971/escape-from-tarkov-radar-esp-win11/releases/latest/download/escape-from-tarkov-radar-esp-win11-v1.2.0-win64.zip
