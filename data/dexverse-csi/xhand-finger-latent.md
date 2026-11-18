# Dexverse-CSI/xhand-finger-latent

## Resumen

xhand-finger-latent es un repositorio de artefactos de representación para manipulación diestra multi-mano, desarrollado por Dexverse-CSI en el contexto del simulador DexVerse. No es un modelo de lenguaje ni un modelo generativo de propósito general: contiene códecs de dedos (encoders/decoders por mano hacia un espacio latente compartido de 32 dimensiones, `z`) y mapas de muñeca `f_task` que se utilizan como piezas intermedias de las políticas cross-hand publicadas en repositorios hermanos (`xhand-crosshand-dp` y `xhand-crosshand-pi05`).

El problema que resuelve es la transferencia entre morfologías de mano: una política entrenada con una mano concreta (por ejemplo, Sharpa) debe ejecutarse sobre otras manos con distinta cinemática (Shadow, Wuji, Allegro, Leap). El códec proyecta configuraciones articulares de cualquier mano a un latente compartido, y el mapa `f_task` relaciona la pose de la palma con la cadena cinemática de los dedos, permitiendo reconstruir la muñeca mediante IK.

Cada códec se entrena sobre las cinco manos (Sharpa 22 DoF, Shadow 22, Wuji 20, Allegro 16, Leap 16) con 209.824 parámetros y latente de 32 dimensiones. El repositorio incluye varias generaciones (v1, v2, v3, v3alt) con selección explícita de variantes, junto con resultados de reconstrucción y de replay cross-hand. Es relevante para investigadores en aprendizaje por imitación robótica que necesiten reutilizar políticas entre manos sin reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códecs encoder/decoder por mano hacia latente compartido de 32-D; mapa de muñeca `f_task` basado en modelo de grafo de eslabones |
| Parametros totales | 209.824 por códec |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo robótico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | `.pt` (pickles de PyTorch), más `config`, `center.json`, `F_M.pt`, `K.pt` |
| Manos soportadas | Sharpa (22 DoF), Shadow (22), Wuji (20), Allegro (16), Leap (16) |
| Dimension latente | 32 |
| Vector de politica | 41-D: `[palm position 3, palm rot6d 6, finger z 32]` |
| Simulador / tareas | DexVerse, mano derecha flotante; `Dexverse-GraspKettle-v0`, `FunctionalHammerStrike` |
| Libreria | lerobot |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La pieza central es un códec por mano que mapea la configuración articular de los dedos a un vector latente `z` de 32 dimensiones compartido entre las cinco manos. Sobre ese latente se construye un vector de política de 41 dimensiones que combina posición de palma (3), rotación en representación rot6d (6, primeras dos columnas de la matriz de rotación) y `z` (32). Existen dos variantes de brazo: la "Z", que usa la palma directamente, y la "D", que sustituye la palma por `EE_common = palm @ inv(f_task(q_finger))` y reconstruye la muñeca mediante IK de muñeca flotante.

El entrenamiento del códec principal, E2* (`arm_latent_v1 e2_lam2.8333`), parte de un warm start desde `all_five_v1` y optimiza reconstrucción más un término λ·residual Kabsch de las almohadillas de las yemas promediado sobre todos los pares ordenados de manos, durante 7500 pasos. La generación v2 introduce invariancia a la mano mediante consistencia de ciclo, escenas emparejadas, adversario y criterio de Fisher, con warm start desde E2* y 3000 pasos (15 variantes). La generación v3 añade alineamiento blanqueado con Barlow Twins, VICReg, espacio nulo y pares por taxonomía (9 variantes), y v3alt repite v3 sobre datos de posturas emparejadas alternativas (human_w, mix_w, playik_w, playik_w3, playik_w10, sobol_w).

El mapa `f_task` de `f_task/p0a` se entrena sobre GraspKettle con Sharpa, Shadow y Wuji, e incluye ablaciones c1–c5. `f_task/h2` se reentrena solo con Shadow y Allegro. El piloto `f_task/g2_pilot_v0` entrena un predictor compartido `EE_hand` sobre datos sintéticos de juego, con variantes leave-one-hand-out.

## Capacidades

- Codificación y decodificación de configuraciones articulares de dedos entre cinco morfologías de mano (Sharpa, Shadow, Wuji, Allegro, Leap) a través de un latente compartido de 32 dimensiones.
- Reconstrucción de pose de dedos desde `z` mediante `Dec_hand(z)`.
- Reconstrucción de muñeca mediante IK de muñeca flotante a partir de la pose de palma; en el brazo D, cálculo de `palm = EE_common @ f_task(Dec_hand(z))`.
- Retargeting cross-hand: replay de trayectorias de una mano sobre otra con residual de almohadillas de yemas medido en milímetros.
- Soporte de representación para políticas de difusión de imagen (image Diffusion Policies) y para deltas pi0.5.
- Mapa de muñeca `f_task` entrenado sobre tres manos y variante `h2` sobre dos manos.
- Predictor piloto `EE_hand` con evaluación leave-one-hand-out.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un componente de robótica.

## Casos de uso

- Transferencia de políticas entre manos en investigación: entrenar una política de difusión con la mano Sharpa y desplegarla sobre Shadow, Wuji, Allegro o Leap usando el latente `z` del códec v2 `cyc05clf05f002` o v3 `wb_cl_l`, que son las variantes con mejor transferencia downstream documentada.
- Retargeting de trayectorias demostradas: convertir secuencias articulares de una mano a otra y medir el residual de almohadillas de yemas (6,18 mm para E2*, 6,72 mm para v2 seleccionado) para decidir si la calidad es suficiente antes de entrenar.
- Replay de tareas de manipulación en DexVerse: reproducir episodios de `Dexverse-GraspKettle-v0` con manos distintas a la de origen, usando la métrica de replay cross-hand sobre 40 puntos como criterio de selección.
- Construcción de espacios de acción compartidos para aprendizaje multi-mano: usar el vector de 41 dimensiones como interfaz común entre políticas y entornos, evitando definir espacios de acción específicos por morfología.
- Evaluación de invariancia de representación: emplear las sondas lineales GEO-H3 y GEO-ALL5 para comparar variantes de códec antes de comprometerse con una arquitectura.
- Integración con pi0.5: alimentar los deltas de pi0.5 con el latente del códec seleccionado en el repositorio `xhand-crosshand-pi05`.
- Estudio de mapeos palma-dedos: usar `f_task` y sus ablaciones c1–c5 para analizar la relación entre cadena cinemática de dedos y pose de palma.

## Benchmarks y rendimiento

Resultados de selección de códec publicados en la model card:

| Codec | Sonda lineal GEO-H3 / GEO-ALL5 (menor = más invariante) | Residual yemas (mm) | Replay Kettle Sharpa→4 manos (/40) |
|---|---|---|---|
| E2* | 1,00 / 1,00 | 6,18 | 35 |
| v2 `cyc05p05` | 0,95 / 0,96 | 6,45 | 35 |
| v2 `cyc05clf05f002` (seleccionado) | 0,84 / 0,82 | 6,72 | 33 |
| v3 `w_cl` | 0,90 / 0,83 | 8,60 | 16 |
| v3 `wv_cl` | 1,00 / 0,99 | 10,96 | 20 |
| v3 `wb_cl_l` (seleccionado) | 0,90 / 0,87 | 7,30 | 31 |
| v3 `wn_cl_l` | 0,99 / 0,99 | 9,02 | 25 |
| v3 `v2n_cl` | 0,87 / 0,81 | 8,70 | 21 |
| v3 `wb_tax_l` | 0,92 / 0,88 | 7,67 | 27 |
| v3 `wb_cltax_l` | 0,93 / 0,90 | 7,64 | 28 |

Resultados adicionales:

| Experimento | Resultado |
|---|---|
| Codec v3alt, mejor replay cross-hand (`mix_w`) | 29/40 (por debajo de v2 con 33 y de E2* con 35) |
| DP de imagen 2/3 manos sobre z de E2* | 0/50 de transferencia a manos no vistas |
| DP sobre z de v2 `cyc05clf05f002` (cv2dp) | Sharpa 15/50 |
| DP sobre z de v3 `wb_cl_l` (cv3dp) | Sharpa 15/50, Leap 21/50 |
| Piloto G2 `f_task`, dispersión EE_common leave-one-hand-out | 30,2 mm-eq frente a 58,2 (Kabsch) y 51,7 (constante por mano); sin ganancia en Sharpa held-out |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los códecs tienen 209.824 parámetros (menos de 1 MB en fp32 por checkpoint). El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte PyTorch; no se requiere A100 ni H100 para cargar los códecs. Las políticas consumidoras (Diffusion Policies de imagen, pi0.5) sí requieren GPU de mayor capacidad, no especificada en la información disponible.
- Cabe en GPU de consumo: sí, cualquier GPU consumer reciente puede cargar los códecs y `f_task`.
- Opciones de despliegue: carga directa con `torch.load` y `huggingface_hub.snapshot_download`; las clases y loaders están en el repositorio de GitHub (`code/arm_train.py: load_arm`, `code/p3h_offsets.py`, `code/p3h_policy_codec.py`, `code/ho_codec.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Manos | Parametros | Latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xhand-finger-latent (este) | Códec de dedos + mapa de muñeca | 5 (Sharpa, Shadow, Wuji, Allegro, Leap) | 209.824 por códec | 32-D | other (no especificada) | Hugging Face |
| xhand-crosshand-dp | Política de difusión de imagen | Configurable vía códec | no disponible | Consume `z` de 32-D | no disponible | Hugging Face |
| xhand-crosshand-pi05 | Deltas pi0.5 | Configurable vía códec | no disponible | Consume `z` de 32-D | no disponible | Hugging Face |

No se dispone de información sobre códecs cross-hand alternativos de otros autores en la documentación proporcionada; la comparación con terceros queda como no disponible.

## Limitaciones y advertencias

- Licencia `other` sin texto especificado: no hay autorización explícita de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Los archivos `.pt` son pickles de PyTorch; la propia model card advierte de cargar solo ficheros de confianza.
- Ninguna variante de códec v2 o v3 superó todas las puertas pre-registradas; las seleccionadas son el mejor compromiso, no un óptimo.
- La transferencia downstream es limitada: la DP de imagen sobre E2* logra 0/50 a manos no vistas, y las mejores variantes alcanzan 15/50 (Sharpa) y 21/50 (Leap).
- El piloto `f_task` G2 no muestra ganancia en Sharpa held-out, lo que limita la generalización del predictor `EE_hand`.
- El códec v3alt no produjo ninguna variante que cumpliera los criterios de DP; no debe usarse como sustituto de v2 o v3.
- El repositorio no incluye datasets, assets de DexVerse ni trazas de evaluación, por lo que la reproducibilidad completa requiere el código de GitHub y los datos originales.
- Los checkpoints intermedios de las ejecuciones e4 de `arm_latent_v1` y los snapshots intermedios de v3 no están incluidos.
- Ámbito restringido a simulación (DexVerse, mano derecha flotante); no hay evidencia de validez en hardware real.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Dexverse-CSI/xhand-finger-latent
- Repositorio de código: https://github.com/eunyoung030927/DexVerse (rama `dev`, carpeta `experiments/cross_hand_latent_codec/`, paquete Python en `code/`)
- Políticas de difusión: https://huggingface.co/Dexverse-CSI/xhand-crosshand-dp
- Políticas pi0.5: https://huggingface.co/Dexverse-CSI/xhand-crosshand-pi05
- Backup personal completo: https://huggingface.co/eunyoung927/xhand-crosshand-ckpts
