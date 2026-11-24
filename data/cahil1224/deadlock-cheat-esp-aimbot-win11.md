# Cahil1224/deadlock-cheat-esp-aimbot-win11

## Resumen

El repositorio `Cahil1224/deadlock-cheat-esp-aimbot-win11` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits distribuido como archivo comprimido (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, 4,8 MB) que la model card presenta como una herramienta de trampas (ESP y aimbot) para el videojuego Deadlock. El autor lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero no incluye pesos, arquitectura ni pipeline de inferencia.

Desde la perspectiva de un editor técnico de IA open source, este artefacto no es evaluable como modelo: no hay parámetros, contexto, tokenizador ni datos de entrenamiento. La model card mezcla referencias a Deadlock y a Marvel Rivals, enlaza binarios alojados en un repositorio de GitHub de terceros y solicita ejecutar un `.exe` como administrador tras extraerlo con una contraseña. Todo ello son señales de riesgo de seguridad, no características de un modelo.

La ficha se redacta para dejar constancia de que la entrada existe en el Hub, pero que no cumple los criterios mínimos para ser catalogada como modelo de IA. Los campos técnicos se marcan como no disponibles porque no existe información verificable, y las advertencias se centran en el riesgo de malware y en el incumplimiento de las condiciones de uso de los videojuegos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según las etiquetas del repositorio, sin relación con capacidades lingüísticas de un modelo) |
| Licencia | MIT (según la model card) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido descrito en la model card es un ejecutable (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, compilación `v1.0.5`, firma `64E4EAA988`) que, según el texto, emplea un núcleo externo en modo usuario con lectura directa de memoria, renderizado mediante Desktop Duplication y superposición externa a 144 Hz o más. Se mencionan también suavizado de entrada Bézier, un radar 2D con filtro de botín y una tecla de pánico (`END`) para descargar el proceso. Ninguno de estos elementos constituye un modelo de aprendizaje automático.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de inferencia. Cualquier afirmación sobre arquitectura transformer, MoE o SSM sería inventada y, por tanto, se omite.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma del repositorio son metadatos sin respaldo técnico.
- El binario descrito pretende ofrecer superposición externa (ESP) con cajas 2D/3D, esqueletos de huesos y distancia, además de aimbot con curvas humanizadas.
- Incluye, según la model card, un radar 2D con filtro de botín por rareza y una tecla de pánico para terminar el proceso.
- Estas supuestas capacidades son funcionalidades de trampa en un videojuego, no capacidades de IA.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son:

- Trampas en Deadlock: el binario se presentaría como una superposición externa para mostrar enemigos y objetos a través de paredes, lo que vulnera las condiciones de servicio del juego.
- Automatización de puntería: el supuesto aimbot con suavizado Bézier apuntaría a objetivos, con riesgo de sanción por parte de la plataforma.
- Evasión de capturas: la capa de renderizado "stream-proof" se describe como exclusión de OBS, ShadowPlay y Discord, lo que sugiere ocultación ante herramientas de grabación.
- Distribución de software con contraseña: el ZIP protegido con la contraseña `2026` y la instrucción de ejecutar como administrador son patrones habituales en campañas de malware.
- Ingeniería social: la model card mezcla nombres de dos juegos distintos (Deadlock y Marvel Rivals) y enlaza a un repositorio de GitHub ajeno, lo que dificulta la trazabilidad.
- Señuelo para descargas: las insignias de "110K+ descargas" y "4,8/5" no son verificables y podrían inflar la percepción de legitimidad.

Ninguno de estos casos es recomendable ni constituye un uso productivo del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación de modelos, porque el artefacto no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows de 64 bits (Windows 10 y 11 según las insignias).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; la model card menciona cifras como 472 Hz de sondeo y 14 hilos de trabajo, pero no son verificables ni corresponden a inferencia de un modelo.
- Consumo de memoria declarado: menos de 32 MB de RAM para el radar 2D, según el texto.

## Comparativa con modelos similares

No disponible. No hay modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con LLM de código abierto, ya que no comparte categoría, parámetros ni finalidad.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y pipeline; no debe catalogarse como tal en un blog técnico.
- Riesgo de malware: un ejecutable sin firma verificable, distribuido en un ZIP con contraseña y con instrucciones de ejecutarlo como administrador, es un vector clásico de infección.
- Inconsistencia de nombres: la model card alterna Deadlock y Marvel Rivals y enlaza a un repositorio de GitHub de otro autor, lo que rompe la cadena de custodia.
- Descargas y valoraciones no verificables: las insignias de 110K+ descargas y 4,8/5 no tienen respaldo en la información proporcionada.
- Licencia MIT declarada: aunque permitiría uso comercial en teoría, la licencia no cubre el incumplimiento de las condiciones de servicio de los videojuegos ni exime de responsabilidad legal.
- Riesgo de sanción: el uso de trampas en juegos multijugador puede conllevar el bloqueo permanente de cuentas y, en algunas jurisdicciones, responsabilidad civil.
- Sin soporte ni mantenimiento: repositorio creado y actualizado el mismo día (2026-11-24), con cero descargas y cero "likes" registrados en el Hub.
- Idiomas: las etiquetas multilingües no implican capacidades reales de procesamiento de lenguaje.
- Recomendación: no descargar ni ejecutar el binario; si se analiza, hacerlo en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cahil1224/deadlock-cheat-esp-aimbot-win11
- Repositorio de GitHub enlazado en la model card (terceros): https://github.com/QakajaVeca60/deadlock-cheat-esp-aimbot-win11
- Repositorio de GitHub alternativo citado en la model card: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026
- Descarga directa citada en la model card (no verificada): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
