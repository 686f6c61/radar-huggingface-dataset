# lmcfarlin/Fara-1.5-9B-Heretic-Uncensored

## Resumen

Fara-1.5-9B-Heretic-Uncensored es una variante "decensored" (mediante ablación de direcciones de rechazo) del modelo Fara1.5-9B de Microsoft Research AI Frontiers, un agente de uso de computadora (CUA) multimodal especializado en navegadores web. El modelo original observa el navegador únicamente a través de capturas de pantalla y emite llamadas a herramientas estructuradas (clic, escritura, scroll, visita de URL, búsqueda web) para completar tareas de extremo a extremo. Esta versión concreta, publicada por el usuario lmcfarlin, aplica la técnica de ablación de rango arbitrario (ARA) de Heretic v2.1.0 sobre las capas 15 a 21 del modelo base para reducir drásticamente las negativas a responder.

El modelo se construye sobre Qwen3.5-9B mediante supervisión fina (SFT) con datos sintéticos generados por el pipeline multiagente FaraGen1.5. Cuenta con 9.409.813.744 parámetros y una ventana de contexto de 262.144 tokens, suficiente para mantener trayectorias completas de múltiples capturas de pantalla y el historial de acciones. Es relevante ahora porque combina percepción visual sin acceso al DOM con acciones ancladas a coordenadas de píxel, lo que lo hace desplegable en una sola GPU de 80 GB y adecuado para automatización web realista.

La modificación Heretic reduce las negativas de 98/100 en el modelo original a 3/100 en esta variante, con una divergencia KL de 0.0315 respecto al original. El autor declara licencia MIT y soporte exclusivo para inglés. No obstante, la eliminación de los mecanismos de rechazo puede afectar a las salvaguardas de "puntos críticos" que el modelo original incorpora para detenerse ante acciones irreversibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM multimodal decoder-only (imagen + texto → texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only multimodal que recibe como entrada el objetivo del usuario en texto, una o varias capturas de pantalla del navegador y el historial previo de pensamientos y acciones del agente. La percepción es exclusivamente visual: no accede al DOM ni al árbol de accesibilidad, sino que predice la siguiente acción con argumentos anclados a coordenadas de píxel (por ejemplo, la posición exacta de un clic). La salida se estructura en un bloque de cadena de pensamiento seguido de un bloque de llamada a herramienta etiquetado en XML.

El entrenamiento parte de Qwen3.5-9B y aplica SFT sobre datos sintéticos generados por FaraGen1.5, un pipeline multiagente que sintetiza tareas web, ejecuta trayectorias para resolverlas y verifica los resultados antes de incorporarlos al conjunto de entrenamiento. El periodo de entrenamiento abarca de enero a abril de 2026, con un coste computacional de 32 GPU NVIDIA B200 durante 4 días, y la publicación del modelo original data del 21 de mayo de 2026. La variante Heretic aplica ablación de rango arbitrario (ARA) con los parámetros start_layer_index=15, end_layer_index=21, preserve_good_behavior_weight=0.8526, steer_bad_behavior_weight=0.0003, overcorrect_relative_weight=0.9496 y neighbor_count=7.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) previo a cada acción.
- Percepción visual basada exclusivamente en capturas de pantalla, sin acceso al DOM.
- Acciones ancladas a coordenadas: clic y arrastre a nivel de píxel sin modelo de grounding separado.
- Llamadas a herramientas estructuradas: clic, escritura, scroll, visita de URL, búsqueda web y otras acciones de navegador.
- Ejecución de tareas web de extremo a extremo: rellenar formularios, reservar, solicitar empleo, planificar viajes, gestionar carritos de compra.
- Diseño de seguridad por "puntos críticos": entrenado para detenerse y preguntar antes de introducir datos personales, pagos, envíos, inicios de sesión o mensajes (potencialmente degradado en esta variante).
- Ventana de contexto de 262.144 tokens para trayectorias con múltiples capturas e historial completo de acciones.
- Soporte multilingüe limitado al inglés.
- Modo "uncensored": reducción de negativas de 98/100 a 3/100 respecto al original.

## Casos de uso

- Automatización de relleno de formularios web: el modelo recibe capturas del formulario y emite clics y texto campo a campo, secuenciando la tarea hasta el envío, con la ventaja de operar solo con lo que ve el usuario.
- Reservas y compras guiadas: planificación de viajes y gestión de carritos de compra en sitios con flujos multi-paso, aprovechando el contexto de 262K tokens para mantener el estado de la trayectoria.
- Solicitud de empleo automatizada: navegación por portales, carga de datos y cumplimentación de cuestionarios, con paradas de confirmación ante datos personales (si las salvaguardas se conservan).
- Agentes de navegación en investigación: extracción de información de sitios mediante búsqueda web y visitas encadenadas, registrando el razonamiento en texto.
- Pruebas de regresión de interfaces web: uso del agente para recorrer flujos de usuario y detectar puntos de fricción, desplegado dentro de MagenticLite con sandboxing.
- Evaluación de robustez de salvaguardas: esta variante permite estudiar cómo la ablación ARA afecta al comportamiento de rechazo y a los puntos críticos de seguridad en agentes CUA.
- Despliegue en una sola GPU: con 9B parámetros en bf16 cabe en A6000, A100, H100 o B200, lo que facilita prototipos y producción en infraestructura moderada.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Negativas (refusals) | 3/100 | 98/100 |
| Divergencia KL | 0.0315 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 9B parámetros en bf16 requieren aproximadamente 18-20 GB de pesos, más el espacio para el historial de capturas de pantalla y la caché KV con contexto de hasta 262K tokens.
- GPU recomendadas: A6000, A100, H100 y B200 han sido probadas según la model card del modelo original.
- Cabe en GPU de consumo: no confirmado en la información disponible; el contexto completo de 262K tokens y las múltiples imágenes por prompt hacen recomendable una GPU profesional.
- Opciones de despliegue: vLLM >= 0.19.1 (comando `vllm serve` con `--dtype bfloat16 --max-model-len 262144 --limit-mm-per-prompt image=10`), transformers >= 5.2.0, torch >= 2.11.0. Despliegue recomendado dentro de MagenticLite o el CLI de GitHub/fara.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Percepción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fara-1.5-9B-Heretic-Uncensored | 9,4B | 262.144 | Solo capturas | MIT | Hugging Face |
| Fara1.5-9B (original) | 9B | 262.144 | Solo capturas | MIT | Hugging Face / Azure Foundry |
| Qwen3.5-9B (base) | 9B | no disponible | Texto (base multimodal) | no disponible | Hugging Face |

La comparativa con otros agentes CUA de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación ARA elimina en gran medida el comportamiento de rechazo (3/100 frente a 98/100), lo que puede degradar los mecanismos de "puntos críticos" diseñados para detener al agente antes de acciones irreversibles como pagos, envíos o introducción de datos personales.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la predicción de coordenadas de clic.
- Sesgos conocidos: no documentados en la información disponible.
- Limitación idiomática: solo inglés.
- Restricciones de licencia: MIT permite uso comercial, pero el autor advierte que debe usarse únicamente con el harness de GitHub/fara o MagenticLite.
- Advertencia de seguridad del autor: no ejecutar el modelo con acceso irrestricto al navegador en una máquina con información sensible; MagenticLite aporta sandboxing, listas de permitidos, modo vigilancia y pausa.
- El modelo fue entrenado entre enero y abril de 2026, con corte de conocimiento a principios de 2026.
- Solo 27 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lmcfarlin/Fara-1.5-9B-Heretic-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo original Fara1.5-9B: https://huggingface.co/microsoft/Fara1.5-9B
- Proyecto Fara: https://aka.ms/fara1.5
- Repositorio GitHub: https://github.com/microsoft/fara
- Paper: https://huggingface.co/papers/2606.20785
- Azure Foundry: https://aka.ms/fara1.5-9B-foundry
- Magentic-UI: https://github.com/microsoft/magentic-ui
- Heretic: https://heretic-project.org
