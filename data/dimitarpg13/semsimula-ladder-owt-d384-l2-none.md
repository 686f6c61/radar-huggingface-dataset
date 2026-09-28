# dimitarpg13/semsimula-ladder-owt-d384-l2-none

## Resumen

dimitarpg13/semsimula-ladder-owt-d384-l2-none es un modelo de lenguaje de 76.770.256 parámetros publicado por el usuario dimitarpg13 como un brazo de la "SemSimula mechanism ladder — OpenWebText, d=384, L=2", un estudio de ablación de mecanismos preinscrito. No es un transformer: implementa Fock-PARFLM v2.1, una arquitectura sin atención, basada en energía y de inspiración física, que integra un sistema mecánico amortiguado en el espacio semántico con dimensión d=384 y 2 capas.

El objetivo del modelo no es la utilidad como asistente, sino la atribución causal de mecanismos. Cada brazo de la escala elimina exactamente un componente sobre un presupuesto de entrenamiento idéntico (532.480.000 tokens), de modo que cada diferencia de perplejidad se puede asignar por construcción al mecanismo retirado y no a un cambio de presupuesto. Este brazo concreto elimina el campo de intercambio (exchange field) conservando el banco de registros y el canal inverso.

Su relevancia es metodológica: sirve como pieza de control para medir cuánto aporta cada mecanismo de una arquitectura no transformer frente a una línea base GPT-2 emparejada. En validación de OpenWebText a bloque 512 obtiene una perplejidad asentada de 66,98, frente a 49,81 del GPT-2 emparejado y 63,51 del brazo con campo de intercambio activo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 (no transformer, sin atención, basada en energía; integración de un sistema mecánico amortiguado en espacio semántico) |
| Parámetros totales | 76.770.256 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (bloque empleado en la evaluación); configuración d=384, L=2 |
| Tipos de cuantización | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (library_name: pytorch); formato exacto del checkpoint no disponible |
| Tamaño del repositorio | 0,6 GB |
| Dataset de entrenamiento | Skylion007/openwebtext |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Tasa de aprendizaje | 0,0012 |

## Arquitectura y entrenamiento

El modelo implementa Fock-PARFLM v2.1. La dinámica se describe mediante la ecuación de movimiento m·ḧ = −∇V_θ(h) − γm·ḣ + F_rc(h, r) + F_φ(h), donde V_θ es el potencial escalar puntual, V_φ el potencial por pares y F_rc el canal inverso a través del cual el banco de registros actúa sobre el estado de los tokens. Este brazo usa un V_θ gaussiano anisotrópico (un banco conjunto × 8 pozos, rango 4), un V_φ estructural-competitivo con top-k = 16 × 4 cabezas, 5 canales ξ y 32 registros. El canal inverso está activado (puerta por capa con calentamiento de 4.000 pasadas), por lo que F_rc ≠ 0 y la trayectoria no es geodésica; el sistema es lagrangiano solo en el sentido de Lagrange–d'Alembert. La integración se realiza con un esquema de tipo BAOAB (mecanizado por el tag `baoab`), y la variante puramente conservativa de la colección (`none-norc`) admite una métrica de Jacobi.

El entrenamiento es deliberadamente controlado: todos los brazos de la escala ven exactamente 532.480.000 tokens sobre el mismo corpus, tokenizador y lotes de validación, de modo que ninguna diferencia se puede atribuir a un presupuesto distinto. No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones. La model card sí documenta un protocolo de predicciones preinscritas (las entradas en cursiva de la tabla de la escala se registraron antes de la ejecución) y una comparación 2×2 para aislar el efecto de V_φ/PARF.

## Capacidades

- Generación de texto autoregresiva en inglés, con perplejidad de 66,98 en validación de OpenWebText a bloque 512.
- Inferencia sin atención y con memoria constante (`attention-free`, `constant-memory-inference`): el coste de memoria no crece con la longitud de la secuencia según la etiqueta declarada por el autor.
- Modelado basado en energía con potencial escalar puntual (V_θ) y potencial por pares (V_φ).
- Banco de 32 registros con canal inverso activo (mecanismo tipo Fock, ruta registro-a-token).
- Integración de dinámica amortiguada en espacio semántico mediante esquema BAOAB.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no; únicamente inglés.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Estudio de ablación de mecanismos: el modelo actúa como brazo de control que elimina el campo de intercambio; comparar su perplejidad (66,98) con la del brazo con campo activo (63,51) permite cuantificar el coste de ese mecanismo con el mismo presupuesto de tokens, sin confundir arquitectura con volumen de entrenamiento.
- Investigación sobre arquitecturas sin atención: sirve como referencia reproducible de un LM no transformer de 76,77 M de parámetros entrenado sobre OpenWebText, útil para comparar familias alternativas al transformer.
- Experimentación con modelado basado en energía: su formulación con potencial escalar y por pares permite probar integradores (BAOAB), métricas riemannianas (métrica de Jacobi) y esquemas de muestreo en un LM real.
- Validación de atribución causal preinscrita: útil como plantilla metodológica para equipos que quieran diseñar estudios con hipótesis registradas antes de la ejecución y presupuesto igualado entre brazos.
- Docencia y divulgación técnica: un modelo de 0,6 GB de repositorio y 76,77 M de parámetros se puede cargar en portátiles y GPU de gama media para explicar dinámicas lagrangianas aplicadas al procesamiento del lenguaje.
- Prototipado de generación de texto en inglés con recursos mínimos: al ser un modelo pequeño y PyTorch puro, permite montar demostraciones locales sin infraestructura de servido especializada.
- Evaluación de coste de memoria en secuencias largas: la propiedad de memoria constante declarada permite experimentar con la escalabilidad del estado sin la matriz de atención cuadrática.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, campo `verified: false` en el model-index):

| Métrica | Dataset | Split | Valor | Notas |
|---|---|---|---|---|
| Perplejidad (asentada) | OpenWebText | validation | 66,98 | Bloque 512; media de las tres últimas evaluaciones de 500 pasos |
| Perplejidad (mejor) | OpenWebText | — | 66,56 | Paso 31.500 |
| Perplejidad (final) | OpenWebText | — | 67,63 | Final del entrenamiento |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,31 GB en fp32 y 0,15 GB en fp16/bf16 para los 76,77 M de parámetros; el coste de activaciones depende del integrador y del número de pasos de la dinámica, no de una matriz de atención.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni similares.
- Cabe en GPU de consumo: sí, sin restricciones prácticas. Funciona en RTX 3060, RTX 4060, RTX 4090 y cualquier GPU integrada con soporte CUDA o ROCm mínimamente capaz. También es viable en CPU.
- Opciones de despliegue: PyTorch puro con el código del autor (library_name: pytorch). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia estándar, dado que la arquitectura no es un transformer.
- Latencia y throughput estimados: no disponible. La inferencia implica integración iterativa de un sistema mecánico (esquema BAOAB), por lo que el coste por token no equivale al de una pasada transformer de igual tamaño.

## Comparativa con modelos similares

Comparación con los demás brazos de la misma escala (todos con 532.480.000 tokens de entrenamiento, mismos datos y tokenizador):

| Modelo | Mecanismo eliminado | PPL asentada | Relación vs GPT-2 emparejado |
|---|---|---|---|
| semsimula-ladder-owt-d384-l2-gpt2-matched | arquitectura de referencia | 49,81 | 1,000× |
| semsimula-ladder-owt-d384-l2-attention | el propio transformer | 63,51 | 1,275× |
| **Este modelo (arm 'none')** | **el campo de intercambio** | **66,98** | **1,345×** |
| semsimula-ladder-owt-d384-l2-attention-potential | conservatividad | 80,90 | 1,624× |
| semsimula-ladder-owt-d384-l2-none-norc | mecanismo de Fock (ruta registro-token) | 87,93 | 1,765× |
| semsimula-ladder-owt-d384-l2-splm-multixi | V_φ (potencial por pares PARF) | pendiente (dentro del 5% de 87,93, predicción preinscrita) | — |
| semsimula-ladder-owt-d384-l2-fock-splm | V_φ con ruta de registro activa | pendiente (dentro del 5% de 66,98, predicción preinscrita) | — |

Diferencias medidas que este brazo ayuda a interpretar: la conservatividad cuesta 17,39 puntos de perplejidad (+27,4%) y el mecanismo de Fock cuesta 20,95 puntos (+31,3%).

Frente a alternativas externas de tamaño comparable (por ejemplo, GPT-2 small de 124 M de parámetros o GPT-2 emparejado en presupuesto), no hay datos publicados en la información disponible más allá de la línea base emparejada que el propio autor reporta con 49,81 de perplejidad.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo ajustado por instrucciones ni un asistente conversacional; no se documenta plantilla de chat ni formato de prompt.
- Resultados no verificados: la perplejidad de 66,98 está marcada con `verified: false` en el model-index.
- Rendimiento inferior a la línea base: con el mismo presupuesto de tokens, queda un 34,5% por encima de la perplejidad del GPT-2 emparejado (66,98 frente a 49,81).
- Solo inglés: el campo `language` del modelo se limita a `en`.
- Profundidad muy reducida: L=2 y d=384, lo que limita su capacidad de modelado en tareas complejas más allá de la perplejidad de lenguaje.
- Contexto limitado: la evaluación se realiza a bloque 512; no hay evidencia de comportamiento fiable en secuencias más largas.
- Sin datos sobre sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: al ser un modelo de lenguaje sin ajuste por instrucciones, no hay mecanismos de mitigación documentados.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero obliga a citar la autoría y a indicar los cambios; conviene revisar la compatibilidad con flujos propietarios.
- Ecosistema limitado: al no ser un transformer, no es compatible con las herramientas habituales (vLLM, llama.cpp, Ollama, TGI), lo que dificulta el despliegue, el fine-tuning con frameworks estándar y la cuantización.
- Adopción muy baja: 105 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Coste de inferencia no caracterizado: al integrar una dinámica por pasos, el coste por token puede ser mayor que el de un transformer de tamaño equivalente; no se publican cifras de latencia ni throughput.
- La model card disponible está truncada en la sección descriptiva del modelo, por lo que parte de los detalles de configuración (tokenizador, secuencia exacta, formato de checkpoint) no se pueden confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
- Brazo de referencia GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Brazo con campo de intercambio activo (arm 'attention'): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo con campo de intercambio como potencial: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo solo conservativo (mecanismo de Fock desactivado): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo Multi-ξ SPLM (sin V_φ ni Fock): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-splm-multixi
- Brazo Fock-SPLM (sin V_φ, con Fock): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-fock-splm
