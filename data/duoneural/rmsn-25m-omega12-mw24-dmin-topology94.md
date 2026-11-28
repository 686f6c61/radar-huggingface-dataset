# DuoNeural/RMSN-25M-Omega12-mw24-Dmin-Topology94

## Resumen

RMSN-25M-Omega12-mw24-Dmin-Topology94 es un punto de control de investigación de 24,9 millones de parámetros desarrollado por DuoNeural, un laboratorio que publica bajo el paraguas de su programa "Topological Phase Map". El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), una arquitectura experimental propia que no sigue el esquema transformer estándar, sino que se organiza en torno a haces (sheaves), condiciones de resonancia de Arnold Tongue y fibrados de dimensión efectiva variable. Este checkpoint concreto corresponde a la topología número 94 de un barrido sistemático y se etiqueta como "Direct TS (no cascade) — soliton-saturated".

El interés del modelo no es práctico sino científico: forma parte de un estudio sobre el límite inferior de dimensión (D_min) en el que la red mantiene la estructura topológica predicha. Según la model card, con D=192 y M_w=24 el modelo no alcanza la separación de fibrados esperada (M_eff=2) y colapsa en M_eff=3 por saturación solitónica, lo que lo convierte en evidencia empírica de una frontera de capacidad espectral. La perplejidad de validación reportada es 157,5 y el exponente de Lyapunov de validación es -0,0014, valor que el autor interpreta como cumplimiento de la "Hamming TS Law" en régimen "True Silent".

Es relevante ahora únicamente para investigadores que sigan la línea de arquitecturas alternativas al transformer y quieran reproducir o contrastar los hallazgos del laboratorio. No hay evidencia de uso en producción, no se documentan idiomas soportados y el repositorio tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), topología #94, Direct TS (no cascade), soliton-saturated |
| Parametros totales | 24,9 M (25M nominal) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`rmsn_best.pt`, diccionario con clave `model`) |
| Dimensión (D) | 192 |
| Profundidad (L) | 16 |
| Ancho de slot (M_w) | 24 (= 2^3 · 3, 3-smooth, v3=1) |
| Omega (Arnold Tongue) | 1/2 |
| M_eff (fibrados) | 3 (soliton-saturated: [L0-L8] + {L11} + {L14}) |
| val_ppl | 157,5 |
| val_lyap | -0,0014 (Direct True Silent) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) es una propuesta propia de DuoNeural que sustituye el bloque transformer por una estructura de haces (sheaves) sobre fibrados con condiciones de resonancia. Los hiperparámetros publicados son D=192 de dimensión de modelo, L=16 capas, ancho de slot M_w=24 y Omega=1/2 como parámetro de Arnold Tongue. El checkpoint se clasifica como "Direct TS (no cascade)", es decir, sin desdoblamiento en cascada de la dinámica de tiempo, y "soliton-saturated", porque la capacidad espectral resulta insuficiente para separar los fibrados previstos y estos coalescen en tres componentes efectivos (M_eff=3) en lugar de los dos esperados.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se especifican detalles sobre el tokenizador, la función de pérdida exacta ni el procedimiento de optimización. El único dato de evaluación reportado es val_ppl = 157,5 y val_lyap = -0,0014, que el autor interpreta como verificación de la "Hamming TS Law" en régimen Direct TS. La innovación técnica declarada es la propia formulación metripléctica con resonancia de Arnold, cuyo comportamiento se estudia en el contexto del límite D_min.

## Capacidades

- Generación de texto: el modelo se etiqueta como `language-model`, pero no se documentan ejemplos, prompts de referencia ni evaluaciones cualitativas de generación.
- Razonamiento: no disponible en la información proporcionada.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas no está informado.
- Capacidades especiales: el modelo se publica como artefacto de investigación sobre topología de redes; su "capacidad" declarada es reproducir el comportamiento topológico de la fase #94 (M_eff=3, val_lyap=-0,0014), no tareas de usuario final.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Reproducción de experimentos del Topological Phase Map: cargar el checkpoint con `torch.load("rmsn_best.pt")` y verificar que la perplejidad de validación coincide con 157,5 y que el exponente de Lyapunov se mantiene en torno a -0,0014, para validar la reproducibilidad del barrido de DuoNeural.
- Estudio del límite D_min: usar este checkpoint como punto de frontera (D=192, M_w=24) para contrastar con topologías de mayor dimensión y determinar en qué punto la red recupera M_eff=2 en lugar de saturar en M_eff=3.
- Investigación sobre dinámica metripléctica: analizar la evolución de los fibrados [L0-L8], {L11} y {L14} para entender cómo se produce la coalescencia de cosets Z_3 cuando la capacidad espectral es insuficiente.
- Docencia y divulgación sobre arquitecturas alternativas: emplear el modelo como ejemplo didáctico de red no-transformer con parámetros topológicos explícitos y de cómo se reporta un resultado negativo (saturación solitónica) en investigación abierta.
- Verificación de la Hamming TS Law: replicar el cálculo del exponente de Lyapunov sobre el conjunto de validación para comprobar la afirmación del autor sobre el régimen "True Silent".
- Base para experimentos comparativos: servir como referencia de 25M parámetros en estudios que comparen familias de modelos pequeños (transformers de tamaño similar) frente a propuestas topológicas en términos de perplejidad y estabilidad dinámica.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| val_ppl | 157,5 | Perplejidad de validación reportada por el autor |
| val_lyap | -0,0014 | Exponente de Lyapunov de validación (Direct True Silent) |
| M_eff | 3 | Fibrados efectivos observados ([L0-L8] + {L11} + {L14}) frente a M_eff=2 predicho |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se dispone de comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24,9 M de parámetros en fp32, el peso ocupa aproximadamente 100 MB; en fp16, unos 50 MB. El repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de gama baja (GTX 1050, RTX 3050) e incluso en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU de consumo actual y en la mayoría de iGPU con memoria compartida suficiente.
- Opciones de despliegue: el autor solo documenta carga directa con `torch.load` y acceso a `ckpt['model']`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni conversión a GGUF, y al no ser un transformer estándar es improbable que estas herramientas funcionen sin adaptación.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada modelos comparables de la misma familia RMSN ni alternativas de 25M parámetros con arquitectura topológica equivalente. La comparación con transformers pequeños de tamaño similar requeriría ejecutar evaluaciones que no se han publicado.

## Limitaciones y advertencias

- Modelo de investigación sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso independiente ni de reproducción por terceros.
- Perplejidad de validación elevada (157,5) para un modelo de lenguaje; no se aportan métricas de calidad de generación ni evaluaciones en tareas.
- Idiomas no documentados: se desconoce qué lenguas cubre y con qué calidad.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas que requieran ventanas largas.
- Arquitectura no estándar: no es compatible con el ecosistema transformer (vLLM, TGI, llama.cpp, Ollama) sin trabajo de adaptación; la carga requiere `torch.load` y conocimiento del formato interno del checkpoint.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni pruebas de generación, no puede descartarse un comportamiento degenerado.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un artefacto de investigación sin garantías, el uso en producción no está respaldado por evaluaciones.
- Afirmaciones del autor no verificadas de forma independiente: la "Hamming TS Law", el régimen "True Silent" y la interpretación del exponente de Lyapunov son marcos propios del laboratorio, no estándares de la comunidad.
- Nomenclatura y etiquetas (`topology-94`, `arnold-tongue`, `wave-research`) sugieren un programa de investigación en curso; el checkpoint puede quedar obsoleto rápidamente dentro del barrido.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-25M-Omega12-mw24-Dmin-Topology94
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub del proyecto: https://github.com/duoneural/rmsn
