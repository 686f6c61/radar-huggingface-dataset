# KevaoGG/schedule-1-cheat-pc

## Resumen

El repositorio `KevaoGG/schedule-1-cheat-pc` no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows de 64 bits distribuido a través de Hugging Face. La model card lo describe como una herramienta externa de tipo "cheat" o "trainer" para el videojuego Schedule 1, con módulos de overlay, ESP, radar y suavizado de entrada. No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados al repositorio.

El artefacto principal es un archivo `schedule-1-cheat-trainer-2026-v1.2.2-win64.zip` de 4,8 MB que se distribuye mediante enlaces a GitHub Releases y que requiere la contraseña `2026` para su extracción. El ejecutable interno, según la documentación del autor, se ejecuta con privilegios de administrador y realiza lectura de memoria de proceso y renderizado por Desktop Duplication.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable como modelo de lenguaje: no tiene parámetros, contexto, cuantizaciones ni licencia de pesos. La ficha que sigue documenta los datos disponibles y señala explícitamente las carencias, así como los riesgos de seguridad asociados a la distribución de binarios opacos con instrucciones para desactivar avisos del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en metadatos; aplica al repositorio, no a pesos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La documentación describe un programa externo en modo usuario que, según el autor, emplea Desktop Duplication para renderizar un overlay sin inyección de DLL en el proceso objetivo, un escáner dinámico de offsets de memoria para resolver punteros tras parches del juego, y suavizado de entrada basado en curvas de Bézier con radio de FOV configurable y comprobación de visibilidad. Se mencionan 12 hilos de trabajo, sondeo a 258 Hz y un consumo declarado inferior a 29 MB de RAM.

No hay información sobre datos de entrenamiento, tokens, composición de dataset, RLHF, DPO ni ninguna técnica de aprendizaje automático. Las cifras de "consistencia" que aparecen en la model card (97,7 %, 98,5 %, 99,8 %) no van acompañadas de metodología, conjunto de prueba ni reproducibilidad, por lo que no deben interpretarse como métricas verificadas.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma del repositorio son metadatos de descubrimiento, no funcionalidad del binario.
- Según la model card, el ejecutable incluye: overlay externo con cajas 2D/3D y esqueletos, radar 2D, filtro de loot por rareza, perfiles JSON intercambiables en caliente y suavizado de puntería.
- El paquete se distribuye comprimido con contraseña y requiere ejecución como administrador.

## Casos de uso

- No se identifican casos de uso legítimos de IA para este repositorio: no es un modelo y no produce inferencia.
- Uso como objeto de estudio de seguridad: analizar en un entorno aislado cómo se estructura un binario que solicita privilegios de administrador y desactiva advertencias del sistema, para documentar patrones de distribución sospechosos.
- Auditoría de cadena de suministro: revisar la discrepancia entre el repositorio de Hugging Face (`KevaoGG/schedule-1-cheat-pc`) y los enlaces de descarga alojados en cuentas de GitHub de terceros (`francescoc822`, `shuhuajeong`).
- Formación en concienciación: emplear la model card como ejemplo de ingeniería social con insignias falsas de descargas, valoraciones y tamaño.
- No es adecuado para producción, investigación de IA, generación de contenido ni integración en pipelines de datos.
- Cualquier uso del ejecutable en un equipo real conlleva riesgo de ejecución de código no verificado y posible incumplimiento de los términos de servicio del videojuego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras de la model card (258 Hz de sondeo, 12 hilos, menos de 29 MB de RAM, 4,8 MB de paquete) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows de 64 bits (etiquetas `windows`, `windows-11`, `x64`).
- Almacenamiento: 4,8 MB para el ZIP; el espacio extraído no se detalla.
- Memoria RAM declarada por el autor: menos de 29 MB durante la ejecución.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de frecuencia de sondeo no son medibles de forma independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo de IA. Frente a un modelo de lenguaje típico, las diferencias son estructurales: ausencia de parámetros, de contexto, de pesos y de pipeline de inferencia.

| Criterio | `KevaoGG/schedule-1-cheat-pc` | Modelo de lenguaje típico |
|---|---|---|
| Naturaleza | Binario Windows x64 | Red neuronal con pesos |
| Parámetros | no disponible | Millones o miles de millones |
| Contexto | no disponible | Miles a millones de tokens |
| Licencia de pesos | no aplica (MIT en metadatos) | Variable |
| Inferencia | No aplica | Requiere GPU/CPU y runtime |

## Limitaciones y advertencias

- No es un modelo de IA: carece de parámetros, tokenizador, contexto y pesos; no puede evaluarse como tal.
- Distribución opaca: el binario se aloja en cuentas de GitHub de terceros distintas del propietario del repositorio en Hugging Face, lo que dificulta verificar procedencia e integridad.
- La model card instruye explícitamente a desactivar o ignorar avisos de Windows Defender y SmartScreen y a ejecutar como administrador, práctica de alto riesgo.
- El uso de contraseña en el ZIP reduce la visibilidad del contenido por parte de escáneres automáticos.
- Riesgo de incumplimiento de los términos de servicio del videojuego y de la legislación aplicable sobre modificación de software de terceros.
- Las métricas de "consistencia" y las insignias de descargas y valoración no son verificables y no deben citarse como evidencia.
- La licencia MIT declarada en metadatos no garantiza derechos sobre el contenido del binario ni sobre componentes de terceros.
- No debe ejecutarse en entornos de producción ni en máquinas con datos sensibles; si se analiza, hacerlo en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KevaoGG/schedule-1-cheat-pc
- Enlace de descarga citado en la model card (GitHub Releases, cuenta de terceros): https://github.com/francescoc822/schedule-1-cheat-trainer-2026/releases/download/v1.2.0/schedule-1-cheat-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub, cuenta de terceros): https://github.com/shuhuajeong/schedule-1-cheat-pc/releases/latest
- Paper, blog o demo oficial: no disponible
