# batteryphil/TripoSG-PRIME-Quant

## Resumen

TripoSG-PRIME-Quant es una cuantización a 4 bits del modelo de generación 3D imagen-a-malla VAST-AI/TripoSG, publicada por el desarrollador independiente Philip Bartsch (@batteryphil) bajo el esquema PRIME-Quant. El modelo base combina un codificador de imagen DINOv2-Large con un transformer de difusión (DiT) de flujo rectificado de 1.500 millones de parámetros que genera mallas 3D watertight a partir de una única imagen de entrada. La aportación de esta versión es reducir el peso en disco de 6,98 GB (FP32) o 3,49 GB (BF16) hasta 0,98 GB, manteniendo una paridad geométrica casi total con el modelo profesor.

La relevancia práctica del modelo reside en que permite ejecutar un pipeline completo de imagen-a-3D en GPU de consumo con tan solo 4 GB de VRAM, sin depender de extensiones compiladas exclusivas de CUDA (diso, spconv, nvdiffrast). Esto lo hace viable tanto en tarjetas NVIDIA como en AMD con ROCm, algo poco habitual en el ecosistema de generación 3D.

La cuantización cubre el 100% de las capas lineales (368 de 368) con un esquema armónico-primo V3_P4_0, e incorpora rotaciones Walsh-Hadamard exactas para las proyecciones de atención y el codificador DINOv2, así como una calibración específica del time_proj de 4.096 pasos. El resultado es un modelo que conserva la calidad geométrica del original con un coste de memoria drásticamente menor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de flujo rectificado (3D Rectified-Flow) de 1.5B + codificador de imagen DINOv2-Large |
| Parametros totales | 1.500 millones (DiT) + DINOv2-Large (tamaño no especificado en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo imagen-a-3D, no textual) |
| Tipos de cuantizacion | 4-bit PRIME-Quant V3_P4_0 (100% de capas lineales, 368/368) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | bartsch-personal-free-5pct-commercial-v1.0 (base MIT) |
| Formato de pesos | Pesos cuantizados PRIME-Quant (0.98 GB en disco); pipeline diffusers >= 0.38 |
| Tamano del repo | 1.1 GB |
| VRAM residente | 1.48 GB (2.66 GB pico con marching cubes 256³) |
| Pasos de inferencia por defecto | 30 (CFG 7.0) |

## Arquitectura y entrenamiento

El modelo base TripoSG emplea un transformer de difusión (DiT) con formulación de flujo rectificado para generar geometría 3D, condicionado por embeddings de imagen extraídos con DINOv2-Large. La generación se materializa mediante marching cubes jerárquico sobre un campo de distancia con signo (SDF) a resolución 256³, produciendo mallas watertight con cientos de miles de vértices. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de ajuste (RLHF/DPO no aplica a un modelo generativo 3D).

La innovación técnica de esta versión es el esquema de cuantización PRIME-Quant: rotación Walsh-Hadamard intercalada QKV/KV H_128 en el procesador de atención (52,5 dB de invariancia BF16 verificada), rotación H_64 exacta para DINOv2 (67,1 dB, similitud coseno de embeddings de 0,9849), y calibración PRIMAL del time_proj en 4.096 pasos (55,17 dB de SNR de validación). El runtime incluido sustituye las extensiones CUDA-only por `skimage.measure.marching_cubes` en PyTorch puro, habilitando ROCm y compatibilidad con `diffusers>=0.38`.

## Capacidades

- Generación de mallas 3D watertight a partir de una única imagen de entrada (image-to-3D).
- Producción de geometría de alta densidad: entre 145K y 302K vértices y hasta 605K caras por asset en los ejemplos publicados.
- Salida en formato `.glb` lista para motores de renderizado y pipelines de contenido 3D.
- Ejecución en GPU AMD (ROCm) y NVIDIA (CUDA) sin extensiones compiladas específicas.
- Inferencia 100% residente en GPU con solo 1,48 GB de VRAM (2,66 GB pico).
- Control de generación mediante número de pasos (por defecto 30), CFG (7,0), profundidad de octree (8) y semilla.
- Integración con el ecosistema diffusers (versión >= 0.38).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concepto 2D se obtiene una malla watertight en unos 19 segundos, adecuada para iterar sobre diseños de props y personajes antes del modelado final.
- Generación de contenido 3D en estaciones de trabajo con GPU de consumo: al requerir solo 4 GB de VRAM, permite ejecutar el pipeline en tarjetas como RTX 3060 o RX 6600 sin infraestructura dedicada.
- Pipelines de imagen-a-3D en producción sobre AMD ROCm: el runtime en PyTorch puro elimina la dependencia de extensiones CUDA-only, habilitando despliegues en clústeres AMD.
- Creación de mallas para impresión 3D: la naturaleza watertight de las salidas reduce la necesidad de reparación de geometría antes del laminado.
- Generación de assets para escenas de realidad aumentada y virtual: mallas de alta densidad exportables en `.glb`, formato estándar de motores web como three.js o Babylon.js.
- Investigación en cuantización de modelos generativos 3D: el esquema PRIME-Quant y los benchmarks de paridad geométrica publicados sirven como referencia reproducible para estudiar el impacto de la cuantización 4-bit en difusión 3D.
- Automatización de catalogos de producto: conversión de fotografías de producto en modelos 3D para visores de comercio electrónico, con coste de memoria compatible con instancias modestas.

## Benchmarks y rendimiento

Resultados verificados en AMD RX 9060 XT 16 GB con ROCm 7.2, pipeline completo FLUX.1-schnell PRIME-Quant → TripoSG, 30 pasos, CFG 7.0, marching cubes jerárquico 256³:

| Metrica | BF16 Teacher | PRIME-Quant (V3_P4_0) |
|---|---|---|
| Pesos en disco (DINOv2 + DiT) | 6,98 GB FP32 / 3,49 GB BF16 | 0,98 GB (174,7 MB DINOv2 + 810,8 MB DiT) |
| Cobertura de lineales cuantizadas | 0 / 368 | 368 / 368 (100%) |
| VRAM residente total (incl. SDF VAE) | 3.865,3 MB | 1.478,7 MB |
| VRAM pico PyTorch (decode SDF 256³) | 5.047,8 MB | 2.661,4 MB |
| Tiempo medio por malla `.glb` watertight | 18,72 s | 18,96 s |

Paridad geométrica por asset (20.000 puntos de superficie muestreados frente al profesor BF16):

| Asset | Chamfer-L1 | F-Score @0.02 | F-Score @0.05 | Consistencia de normales | Watertight |
|---|---|---|---|---|---|
| 01_knight_helmet (268K verts / 536K caras) | 0,00869 | 92,35% | 99,28% | 0,8334 | Si |
| 02_scifi_mech (302K verts / 605K caras) | 0,01235 | 86,66% | 100,00% | 0,7798 | Si |
| 03_treasure_chest (145K verts / 290K caras) | 0,04488 | 27,45% | 57,02% | 0,7026 | Si |

En el asset 03_treasure_chest, el profesor BF16 generó una geometría espuria (falda de sombra junto a la base) que penaliza la métrica de Chamfer frente a la salida más limpia de PRIME-Quant; el autor lo documenta explícitamente.

## Requisitos de hardware

- VRAM residente: 1,48 GB; pico de 2,66 GB con decodificación SDF a 256³.
- GPU mínima recomendada: 4 GB de VRAM (el autor indica compatibilidad con GPUs de 4 GB o más).
- GPUs verificadas: AMD RX 9060 XT 16 GB con ROCm 7.2 (entorno de referencia).
- GPUs compatibles por arquitectura: NVIDIA CUDA y AMD ROCm; no requiere extensiones CUDA-only.
- GPUs de consumo plausibles por VRAM: RTX 3050/3060/4060, RX 6600/7600 y superiores (no verificadas explícitamente en la información disponible).
- Despliegue: runtime standalone incluido (`run_triposg_prime.py`, `prime_infer_runtime.py`) y pipeline `diffusers>=0.38`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión 3D).
- Latencia: ~18,96 s por malla `.glb` watertight en RX 9060 XT 16 GB (30 pasos, CFG 7,0).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Peso en disco | VRAM pico | Licencia | Formato |
|---|---|---|---|---|---|---|
| TripoSG-PRIME-Quant | 1,5B (DiT) + DINOv2-Large | Cuantización 4-bit de TripoSG | 0,98 GB | 2,66 GB | Bartsch personal-free + 5% comercial | PRIME-Quant / diffusers |
| VAST-AI/TripoSG (base) | 1,5B (DiT) + DINOv2-Large | DiT flujo rectificado BF16/FP32 | 3,49 GB BF16 / 6,98 GB FP32 | 5,05 GB | MIT | safetensors / diffusers |
| Otras alternativas image-to-3D | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible con el modelo base, dado que la información proporcionada no incluye datos de otros modelos image-to-3D comparables.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Bartsch Personal-Free & 5% Commercial Profit-Share v1.0 permite uso personal, investigación, académico y sin ánimo de lucro, pero el uso comercial requiere un acuerdo de reparto de beneficios del 5%; no es una licencia de código abierto.
- El modelo base TripoSG es MIT, pero los checkpoints y el runtime PRIME-Quant quedan bajo la licencia del autor.
- Riesgo de artefactos geométricos en entradas ambiguas: el propio autor documenta geometría espuria (sombras o faldas) en el modelo profesor BF16, lo que indica sensibilidad a la imagen de entrada.
- La calidad depende fuertemente de la imagen de entrada; no se documentan mecanismos de rechazo o validación de entradas.
- Sin capacidades de lenguaje, tool calling ni agentes: es exclusivamente un generador de mallas 3D.
- Sin información sobre sesgos (no aplica en el sentido textual, pero puede heredar sesgos del dataset de entrenamiento original de TripoSG, no documentados aquí).
- Sin datos publicados sobre robustez ante imágenes fuera de distribución, oclusiones o fondos complejos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación comunitaria prácticamente inexistente.
- El pipeline requiere `diffusers>=0.38` y un parche propio (`triposg/`) incluido en el repo; no es un drop-in directo del modelo base.
- No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de calibración más allá de lo descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/batteryphil/TripoSG-PRIME-Quant
- Modelo base: https://huggingface.co/VAST-AI/TripoSG
- Licencia del modelo: https://huggingface.co/batteryphil/TripoSG-PRIME-Quant/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/batteryphil/TripoSG-PRIME-Quant/blob/main/NOTICE
- Benchmark completo: `benchmarks/triposg_bf16_vs_prime_benchmark.json` (incluido en el repositorio)
- Script de ejecución: `run_triposg_prime.py` (incluido en el repositorio)
- Runtime de inferencia: `prime_infer_runtime.py` (incluido en el repositorio)
