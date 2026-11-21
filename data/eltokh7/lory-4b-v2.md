# eltokh7/lory-4b-v2

## Resumen

Lory-4B v2 es un modelo de decisión especializado en la simulación de encuestados sintéticos, desarrollado por eltokh7. Se construye sobre Kev-4B (Jared Palmer), un backbone híbrido Gated DeltaNet + atención derivado de Qwen3.5-4B-Base, y se distribuye con pesos `bf16` ya fusionados (unos 8,1 GB). Su función no es la generación de texto conversacional al uso, sino producir distribuciones de probabilidad calibradas sobre opciones discretas ante estímulos económicos: precios, cuotas, pagos, retrasos e incentivos estratégicos.

El modelo opera en dos modos. En modo por defecto responde de forma económicamente consistente a los incentivos planteados; si se le añade un rasgo `style`, conmuta a distribuciones de elección humana empírica (modo "persona típica"). Esa conmutación se resuelve en un único forward pass, sin cadenas de razonamiento explícitas ni múltiples llamadas.

Con 4.205.751.296 parámetros, licencia Apache 2.0 y un pipeline declarado de `text-classification`, Lory-4B v2 es relevante para investigación en economía del comportamiento, ciencias sociales computacionales y experimentación con encuestas sintéticas a bajo coste, donde el throughput y el coste por respondiente importan más que la profundidad estratégica de un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet + atención (backbone Qwen3.5-4B-Base vía Kev-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en `bf16`; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,4 GB; pesos `bf16` fusionados de ~8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Kev-4B, un backbone híbrido que combina capas Gated DeltaNet con atención sobre la base Qwen3.5-4B-Base. Sobre ese backbone se aplica una técnica que el autor denomina Weight-Space Programming centrada en el origen: se parte del delta `D0 = ΔW(kev-4b)` y se combinan dos checkpoints LoRA (`v4b` al 60% y `v4d` al 40%) en el espacio de deltas, preservando los subespacios completos de los donantes con restauración de norma RMS por módulo. El resultado, `D0 + δ_blend`, se fusiona directamente en `Qwen/Qwen3.5-4B-Base` en `fp32` con un único redondeo a `bf16`, de modo que el artefacto distribuido es autocontenido y no requiere fusión PEFT en el arranque.

Sobre el backbone mezclado se añade una cabeza pointer emparejada al checkpoint `v4d` (`h_v4d`, `dp=256`, temperatura nativa `T = 1.0`), pensada para conservar la conmutación nítida al modo persona típica y la calibración en apuestas. La selección de variantes se hizo exclusivamente sobre suites de desarrollo (`human` parte 1, `probes2`, `c13k_val80`, `dose_lottery`, `dose_game`); `blind3`, `human2`, el test de `c13k` y `Psych-101/201` se mantuvieron intactos hasta la evaluación final. La procedencia queda registrada en `wsp_provenance.json`. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Producción de distribuciones de probabilidad calibradas sobre opciones discretas (choice) en un único forward pass.
- Respuesta a incentivos económicos reales: precios, cuotas, pagos, retrasos y estructuras de apuestas.
- Modo por defecto económicamente consistente y conmutación limpia a distribuciones de elección humana empírica al añadir un rasgo `style`.
- Atribución de rasgos: el modelo responde a rasgos de persona (`persona`, `money`, `style`) y reduce la fuga de rasgos irrelevantes.
- Modelado de pendientes numéricas: elasticidad ante variaciones de renta, pendiente de lotería y desplazamiento de pagos en escenarios de pánico bancario.
- Razonamiento estratégico básico en juegos y escenarios de equilibrio, con menor profundidad que la variante de 27B.
- Integración con EDSL: ejecución de cualquier `Survey` de EDSL contra el endpoint y devolución de probabilidades de respuesta como DataFrame.
- Servicio vía `kev.serve` con API HTTP compatible (`/v1/systemone`).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Encuestas sintéticas a gran escala: ejecutar un `Survey` de EDSL contra el endpoint y obtener probabilidades por opción en lugar de una única respuesta, lo que permite analizar la incertidumbre de cada respondiente simulado. El throughput superior a 50 peticiones/s en una A100 lo hace viable para muestras de miles de respondientes.
- Investigación en economía del comportamiento: replicar experimentos de elección con apuestas, loterías y descuentos temporales, usando el modo por defecto para consistencia económica y el modo `style` para aproximar respuestas humanas observadas.
- Pretest de cuestionarios: estimar la distribución de respuestas esperada antes de field work, detectando opciones dominantes o mal calibradas y ajustando el diseño del instrumento.
- Simulación de escenarios de política económica: modelar cómo cambia la disposición a aceptar un pago o una cuota ante variaciones de renta o de incentivo, aprovechando las pendientes numéricas del modelo.
- Análisis de pánico bancario y juegos estratégicos: estudiar desplazamientos de comportamiento ante cambios en el payoff, con la advertencia de que la profundidad de equilibrio es limitada frente a la variante de 27B.
- Generación de datos sintéticos para calibración de modelos de elección discreta: producir probabilidades etiquetadas que sirvan como previas o como aumento de datos en pipelines de estimación.
- Despliegue en hardware de gama media: servir el modelo en cualquier GPU con 16 GB o más, o en Apple Silicon vía MPS/MLX, para entornos de investigación con presupuesto limitado.

## Benchmarks y rendimiento

| Modelo | DLS v0.2 (9 fam) | Blind v1 | Blind v2 | Sealed Blind v3 | Probes v1 | Probes v2 | Bank-run payoff shift (80) | Lottery slope (1.0) | Twin shift (50) | Kev `v7` dev |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lory-4B v2 | 82 | 86 | 68 | 73 | 67 | 66 | 38.0 | 0.68 | 42.0 | 0.868 |
| Lory-4B v1 | 79 | 81 | 60 | — | 65 | — | 28.5 | 0.51 | 18.0 | 0.866 |
| Kev-4B (released) | 53 | 67 | — | — | — | — | −1.0 | 0.05 | 10.0 | 0.873 |
| Lory-27B v1 (ref) | 88 | 92 | 70 | 73 | 68 | 67 | 66.5 | 0.77 | 32.0 | 0.869 |
| Lory-27B v2 (ref) | 89 | 95 | 79 | 80 | 75 | 71 | 63.5 | 0.94 | 49.5 | 0.878 |

| Modelo | `human` part 1 (typ / def / gap) | Sealed `human2` (typ / def / gap) | `Choices13k` (typ r / MAE / side) | `Psych-101/201` (typ r / MAE / side) |
|---|---:|---:|---:|---:|
| Lory-4B v2 | 57.9 / 40.3 (+17.6) | 50.4 / 36.7 (+13.7) | +0.79 / 10.3 pp / 82% | +0.687 / 13.2 pp / 75% |
| Lory-4B v1 | 32.6 / 32.5 (+0.1) | — | — | — |
| Lory-27B v2 (ref) | 68.1 / 51.7 (+16.4) | 53.9 / 45.7 (+8.2) | +0.85 / 8.9 pp / 86% | +0.754 / 12.4 pp / 74% |

## Requisitos de hardware

- VRAM estimada para inferencia en `bf16`: en torno a 8,1 GB de pesos más overhead de activaciones y KV cache; el autor indica que basta cualquier GPU con 16 GB o más.
- GPU recomendadas: A100 para servir con throughput alto (más de 50 peticiones/s según el autor); cualquier GPU de 16 GB o más para uso individual.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más (por ejemplo, gamas de 16 GB en adelante); no se documenta el comportamiento en GPUs de 8 GB.
- Apple Silicon: soportado vía `--device mps` o MLX, con carga directa de los pesos `bf16` pre-fusionados sin paso de merge.
- Opciones de despliegue: `kev.serve` (repositorio `jaredpalmer/kev`, commit `2074cc4`, `uv sync --extra serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: más de 50 peticiones/s en una A100; coste declarado inferior a 0,25 USD por 1.000 respondientes × 20 preguntas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sealed Blind v3 | `human2` gap | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Lory-4B v2 | 4,2 B | no disponible | 73 | +13.7 | Apache 2.0 | Hugging Face |
| Lory-4B v1 | 4,2 B | no disponible | no disponible | no disponible (sin conmutación humana: +0.1 en `human` part 1) | Apache 2.0 | Hugging Face |
| Kev-4B | 4,2 B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Lory-27B v2 | 27 B (aprox.) | no disponible | 80 | +8.2 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Menor profundidad estratégica que la variante de 27B: el desplazamiento de payoff en pánico bancario es de 38 frente a 63,5 en Lory-27B v2, y la pendiente de juego de 0,38 frente a 0,83, lo que refleja el techo de capacidad del 4B en razonamiento de equilibrio multi-paso.
- Riesgo de alucinación en el sentido de producir distribuciones plausibles pero no respaldadas por datos humanos reales; el modo por defecto es una construcción económica, no una estimación empírica.
- El modo persona típica depende de la presencia y redacción del rasgo `style`; sin él, el modelo no reproduce distribuciones humanas observadas.
- Sesgos conocidos: no se documentan en la información disponible; la calibración se ha evaluado sobre conjuntos concretos (`Choices13k`, `Psych-101/201`) y su generalización a otras poblaciones o dominios no está establecida.
- Idiomas soportados no disponibles; no se garantiza un comportamiento consistente fuera del inglés, idioma de los ejemplos de la model card.
- Longitud de contexto no disponible, lo que impide planificar escenarios con estados de persona muy extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Kev-4B y de Qwen3.5-4B-Base.
- El despliegue está ligado a `kev.serve` en un commit concreto; no se documentan integraciones con servidores de inferencia estándar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es aún inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eltokh7/lory-4b-v2
- Modelo base Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Variante de referencia Lory-27B v2: https://huggingface.co/eltokh7/lory-27b-v2
- Repositorio de serving: https://github.com/jaredpalmer/kev
