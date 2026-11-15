# Imok282/lunar-lander-pilot

## Resumen

Lunar Lander Pilot es un modelo de aprendizaje por refuerzo desarrollado por Imok282 (proyecto Adinfinitium) que actúa como un piloto automático para el descenso de un módulo de aterrizaje lunar en simulación. Se trata de una corrección residual aprendida sobre la guía clásica ZEM/ZEV: la acción final se calcula como `clip(classic(obs) + 0.3 * clamp(r), -1, 1)`, de modo que con el residuo a cero el modelo se comporta exactamente igual que la guía clásica. El modelo se presentó en el contexto del proyecto NASA Space Apps 2026 *Lunar Landing Site Navigator*, dentro de una cadena de modelos que incluye una red de peligrosidad, una red de iluminación, un modelo de terreno, un cerebro de rover y este piloto.

La arquitectura, denominada `PilotFormer`, es un transformer que combina una imagen de cámara de 32x32 píxeles procesada por un stem convolucional en 64 tokens, junto con un token de estado de 24 números, y dos cabezas de salida. Los valores por defecto son dimensión 384, 8 capas, 8 cabezas, crop 32 y stem 48, con aproximadamente 15 millones de parámetros según el paquete (sin recuento exacto registrado). El checkpoint `lander_pilot.pt` ocupa 59.409.547 bytes y el repositorio completo 0,1 GB.

Su relevancia es acotada y experimental: los resultados publicados son de simulación y de sitios retenidos, no de misión real, y la propia model card advierte que no es apto para vuelo ni para decisiones operativas de aterrizaje. La ganancia agregada sobre la guía clásica es pequeña y procede íntegramente de un único sitio (Site42), lo que lo convierte en un caso de estudio de corrección residual con PPO más que en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `PilotFormer`: stem convolucional (imagen 32x32 a 64 tokens) + token de estado de 24 numeros + transformer con dos cabezas |
| Parametros totales | Aproximadamente 15 millones (segun el paquete; sin recuento exacto registrado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch `lander_pilot.pt` (59.409.547 bytes); libreria pytorch |

## Arquitectura y entrenamiento

`PilotFormer` es un transformer con dos entradas: por un lado, un stem convolucional que divide una imagen de cámara de 32x32 en 64 tokens; por otro, un token que codifica el estado de 24 números. El transformer procesa la secuencia combinada y alimenta dos cabezas de salida. Los hiperparámetros por defecto son `d 384`, 8 capas, 8 cabezas, `crop 32` y `stem 48`. La salida se integra con la guía clásica ZEM/ZEV mediante una corrección residual escalada por 0,3 y recortada al rango [-1, 1], lo que garantiza que el modelo no se desvíe de la política clásica más allá de ese margen.

El entrenamiento se realizó con PPO antes de la entrega del paquete; el número de actualizaciones no está registrado. Los modelos se congelaron con SHA-256 antes de la evaluación en sitios retenidos, y los sitios de test se evaluaron una sola vez. Los datos de terreno proceden de modelos digitales de elevación NASA LOLA de 5 m del polo sur lunar. La model card indica que el trabajo de auto-mejora aceptó 0 de 7 candidatos, y que la cámara del piloto ve el mapa de peligrosidad basado en regla de pendiente, no la U-Net de peligrosidad.

## Capacidades

- Control de descenso lunar en simulación: genera acciones de aterrizaje a partir de una imagen de cámara de 32x32 y un vector de estado de 24 números.
- Corrección residual sobre guía clásica: con el residuo a cero replica exactamente la política ZEM/ZEV clásica.
- Percepción visual de bajo coste: procesa imágenes de cámara pequeñas mediante un stem convolucional.
- Toma de decisiones en un solo paso por observación, sin memoria conversacional ni contexto largo.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- No es un modelo multilingüe ni de generación de texto.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a guiado: sirve como ejemplo reproducible de corrección residual sobre un controlador clásico, con separación clara entre política base y residuo aprendido.
- Estudio de evaluación estadística de políticas: el uso de McNemar sobre misiones emparejadas y sitios retenidos permite analizar cómo medir mejoras marginales de forma rigurosa.
- Simulación educativa de aterrizaje lunar: el modelo puede integrarse en entornos de simulación para demostrar el comportamiento de un piloto automático híbrido.
- Análisis de robustez ante condiciones adversas: los conjuntos "harsh" con tasas de fallo triplicadas permiten estudiar la degradación del controlador.
- Comparación de arquitecturas de percepción ligera: el stem convolucional sobre imágenes de 32x32 y el token de estado de 24 números ofrecen una base para experimentos de fusión multimodal de bajo coste.
- Docencia sobre PPO y políticas residuales: el paquete incluye registros y hand-off que permiten reproducir el pipeline de entrenamiento y evaluación en un contexto académico.
- Referencia para pipelines de congelación y verificación de checkpoints: el uso de SHA-256 y evaluación única de sitios de test es un patrón reutilizable en proyectos de investigación.

## Benchmarks y rendimiento

Resultados de éxito de aterrizaje en simulación (cifras copiadas de los registros del proyecto; "harsh" implica tasas de fallo triplicadas):

| Conjunto | Pilot | Guia clasica | Significacion |
|---|---|---|---|
| 3 mapas no vistos agrupados, normal (2.304 misiones emparejadas) | 0,9839 | 0,9766 | McNemar p = 0,0186 |
| 3 mapas no vistos agrupados, harsh | 0,9692 | 0,9631 | p = 0,184 (no significativo) |
| Site23 examen final, normal (volado una vez) | 0,9795 | 0,9795 | p = 1,000 |
| Site23 examen final, harsh | 0,9629 | 0,9648 | p = 0,875 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con unos 15 millones de parámetros y un checkpoint de 59,4 MB, la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint y de la arquitectura.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; al ser un checkpoint PyTorch de refuerzo, el despliegue requiere cargar `lander_pilot.pt` con PyTorch y el código del paquete.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lunar Lander Pilot (Imok282) | ~15 M | No aplica | 0,9839 en 3 mapas no vistos (normal) | Apache 2.0 | Hugging Face |
| Guia clasica ZEM/ZEV | No aplica (controlador analitico) | No aplica | 0,9766 en el mismo conjunto | No aplica | Referencia en la model card |
| Auto-pilotos de Lunar Lander en Hacker News | No disponible | No aplica | No disponible | No disponible | Demostracion en linea |

No se dispone de otros modelos comparables de la misma categoria con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La ganancia agrupada procede íntegramente de Site42; Shoemaker y DM2 empatan, y en Site23 el piloto no supera a la guía clásica.
- En condiciones "harsh" la mejora no es estadísticamente significativa (p = 0,184).
- 37 de los 77 accidentes en Site11 son tomas de contacto con velocidad lateral.
- El trabajo de auto-mejora aceptó 0 de 7 candidatos.
- La cámara del piloto ve el mapa de peligrosidad basado en regla de pendiente, no la U-Net de peligrosidad.
- Todas las cifras son de simulación y de sitios retenidos, no de misión real.
- No apto para vuelo, para decisiones de aterrizaje críticas para la seguridad ni para uso operativo; solo investigación y educación.
- Licencia Apache 2.0, que permite uso comercial, pero la model card restringe explícitamente el uso a investigación y educación.
- No hay datos publicados sobre sesgos, alucinación o limitaciones idiomáticas porque no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Imok282/lunar-lander-pilot
- Repositorio de hand-off (código, registros y `CHECKPOINTS.sha256`): https://github.com/oasisk/adinfinitium-handoff
- Show HN sobre un autopiloto para el juego Lunar Lander: https://news.ycombinator.com/item?id=35090054
