# MrLayen/plank-designer-v6-27b

## Resumen

plank-designer-v6-27b es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario MrLayen, especializado en el diseño de estructuras de tablones (plank structures) que un robot industrial KUKA ensambla a partir de piezas de madera medidas y disponibles en una célula de trabajo real. El modelo recibe una petición en inglés o alemán ("build a square", "eine Brücke über 1,2 m") junto con un inventario de piezas identificadas (por ejemplo `WI 052 1313x99`) y devuelve un plan en JSON con nodos, miembros con capas y la pieza asignada a cada miembro.

El modelo sustituye a la versión anterior plank-designer-v4-27b, que estaba entrenada para una mesa de 3900 x 2400 mm con sierra disponible. La versión v6 se adapta a una célula real de 3250 x 2026 mm, con piezas de entre 350 y 1500 mm y sin sierra, por lo que las piezas deben usarse enteras. Está pensado para integrarse en la aplicación Plank Studio, concretamente en el paquete ROS 2 `kuka_plank_structures`.

Técnicamente se distribuye como adaptador PEFT (LoRA de rango 16, 435 MB) sobre el modelo base, además de una versión fusionada y cuantizada a GGUF Q6_K (22 GB) lista para Ollama. El modelo base tiene 26.895.998.464 parámetros (~26,9 mil millones) y el contexto configurado en el Modelfile de Ollama es de 40960 tokens. La licencia es Apache 2.0 y los idiomas declarados son inglés y alemán.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen/Qwen3.8-27B, con atención estándar, atención lineal y proyecciones MLP; ajuste fino LoRA |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | 40960 tokens (configurado en el Modelfile de Ollama) |
| Tipos de cuantización | Q6_K (GGUF publicado); el autor indica que Q6_K rinde igual que bf16 y Q8_0 (dentro de 1-2 puntos) |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA `adapter_model.safetensors`), GGUF (`gguf/plank-designer-v6-27b.gguf`), Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre las proyecciones de atención, atención lineal y MLP del modelo de lenguaje del base Qwen/Qwen3.8-27B (revisión `1d4bf0f`), en modo solo texto y con prompts construidos con `enable_thinking=False`. El entrenamiento es de tipo SFT (supervised fine-tuning) con pérdida calculada únicamente sobre las respuestas.

El conjunto de datos de la versión v6 consta de 6400 conversaciones (10,3 millones de tokens) que incluyen peticiones con tamaño explícito y peticiones vagas ("a square", "small", "as big as possible", donde el tamaño se deduce de las piezas), respuestas de tipo "cannot" con las longitudes que faltan, peticiones imposibles, seguimientos a medida que llegan piezas, y distintos tipos de inventario: el inventario real, el inventario real con piezas agotadas, inventarios sintéticos similares y montones de recortes antiguos. La mitad de los ejemplos usan los valores de la célula real y el resto tamaños de mesa, límites de longitud y tamaños de tablón aleatorios. El entrenamiento se realizó con lr 2e-4 con decaimiento coseno, 2 épocas, precisión bf16, y duró 103 minutos en 4 GPU NVIDIA GH200 en el centro de supercomputación JUPITER (Jülich). El 16 % de los datos de entrenamiento incluye `allow_cuts: true`.

## Capacidades

- Generación de planes JSON estructurados para estructuras de tablones: nodos, miembros con capas y asignación de pieza a cada miembro.
- Interpretación de peticiones en inglés y alemán, tanto con dimensiones explícitas como vagas ("small", "as big as possible").
- Razonamiento sobre inventario: selecciona piezas concretas del listado disponible (identificadores tipo `WI 001`) y respeta la restricción de usar piezas enteras cuando `allow_cuts: false`.
- Detección de imposibilidad: responde "cannot" indicando las longitudes que faltan cuando las piezas no permiten construir la estructura solicitada.
- Modo de pensamiento (thinking) configurable: `think: false` para uso normal y `think: true` para formas nuevas no vistas en entrenamiento.
- Manejo de conversaciones de seguimiento a medida que llegan nuevas piezas al inventario.
- Adaptación a distintos tamaños de mesa, límites de longitud y tamaños de tablón indicados en el prompt del sistema.
- Soporte de `allow_cuts: true` para escenarios con sierra disponible (entrenado con el 16 % de los datos).
- Integración con Ollama mediante Modelfile y con transformers + PEFT.
- Soporte de plantilla de chat y tokenizador del modelo base.

## Casos de uso

- Diseño automatizado de estructuras en célula robotizada: el modelo traduce una petición en lenguaje natural y el inventario de piezas en un plan JSON que el paquete ROS 2 `kuka_plank_structures` puede interpretar para que el robot KUKA ensamble la estructura, usando solo piezas enteras de la mesa de 3250 x 2026 mm.
- Asistente de operario en Plank Studio: el operario describe la forma deseada ("build a square", "eine Brücke über 1,2 m") y el modelo genera el plan con las piezas realmente disponibles, con un tiempo de respuesta de unos 2 segundos por respuesta en una GH200 con `think: false`.
- Planificación con restricciones de inventario: cuando el inventario cambia (piezas agotadas o nuevas piezas recibidas), el modelo puede procesar seguimientos conversacionales y recalcular el plan con las piezas restantes.
- Exploración de formas no entrenadas: con `think: true` (mediana de 23 segundos, temperatura 0,6, top_p 0,95, top_k 20) el modelo aborda círculos, estrellas, letras y otras formas fuera de la distribución de entrenamiento, con hasta 2 rondas de reparación.
- Detección temprana de imposibilidad: el modelo responde "cannot" con las longitudes faltantes cuando la petición no es construible con las piezas disponibles, lo que permite al operario o al sistema solicitar piezas adicionales antes de intentar el ensamblaje.
- Prototipado rápido en investigación robótica: al distribuirse como adaptador LoRA (435 MB) sobre Qwen3.8-27B, permite experimentar con el ajuste sin necesidad de reentrenar el modelo base, y la versión GGUF Q6_K (22 GB) facilita el despliegue en una estación con GPU de 24 GB.
- Validación de planes antes del ensamblaje físico: el plan JSON generado puede pasarse por las reglas de la célula y el solver de Plank Studio (una ronda de reparación) para verificar que la estructura es construible antes de que el robot la ejecute.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan v6 (Q6_K) con v4-27b en peticiones para la célula real, verificadas con las reglas de la célula (solo piezas enteras) y el flujo de Plank Studio (1 ronda de reparación, el solver elige piezas donde el modelo falla, y se vuelve a preguntar sin piezas cuando responde "cannot"). Los valores son porcentajes (valid = construible con las piezas listadas; shape = la forma pedida, por ejemplo un cuadrado realmente cuadrado):

| Conjunto de prueba | v4-27b (valid / shape) | v6 Q6_K (valid / shape) |
|---|---|---|
| 142 peticiones, las 80 piezas reales disponibles | 84 / 75 | 96,5 / 87,5 |
| 100 peticiones, de 10 a 40 piezas reales | 83 / 69 | 91 / 88 |
| 27 peticiones típicas ("build a square", "Baue ein Sechseck", "as big as the pieces allow") | 85 / 57 | 93 / 100 |
| Peticiones que las piezas no permiten construir y terminan en "cannot" | 36 de 41 | 37 de 41 |

En formas nuevas no vistas en entrenamiento (35 peticiones: círculos, estrellas, letras, etc.) con thinking activado y hasta 2 reparaciones: 34 construibles y 30 construibles y según especificación, frente a 35 y 32 de v4-27b. El autor indica que Q6_K obtiene la misma puntuación que bf16 y Q8_0 (dentro de 1-2 puntos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB libres de GPU para la versión Q6_K con contexto de 40K (medido: 23,6 GB a 40K de contexto).
- GPU recomendadas: NVIDIA GH200 (referencia del autor, ~2 s por respuesta con `think: false`); una RTX 5090 es capaz de alojar el modelo Q6_K.
- Cabe en GPU de consumo: sí, en tarjetas con ~24 GB o más de VRAM (RTX 5090 confirmada por el autor); no se dispone de datos para otras GPU de consumo.
- Opciones de despliegue: Ollama (probado con la versión 0.40.16, mediante el Modelfile incluido), transformers + PEFT (con `AutoModelForImageTextToText` y `PeftModel`), y GGUF Q6_K para otros runners compatibles. No se mencionan vLLM, TGI ni llama.cpp en la información disponible.
- Latencia y throughput: ~2 s por respuesta con `think: false` en una GH200; mediana de 23 s con `think: true` para formas nuevas. No se proporcionan cifras de throughput (tokens/s).
- Script de instalación: `setup_llm_server.ps1` / `setup_llm_server.cmd -Models plank-designer-v6-27b` en Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plank-designer-v6-27b (este modelo) | ~26,9 mil millones (base) + LoRA r16 | 40960 tokens | Diseño de estructuras de tablones para célula KUKA sin sierra | apache-2.0 | Hugging Face (adaptador + GGUF Q6_K) |
| plank-designer-v4-27b | ~26,9 mil millones (base) + LoRA | no disponible | Diseño de estructuras para mesa 3900 x 2400 mm con sierra | no disponible | Hugging Face (versión anterior) |
| Qwen/Qwen3.8-27B (modelo base) | 26.895.998.464 | no disponible | Modelo de lenguaje generalista | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks estándar ni de otros modelos especializados comparables en la información proporcionada. La comparación con v4-27b se limita a los resultados de la tabla de benchmarks del autor.

## Limitaciones y advertencias

- En su primera respuesta, el modelo a menudo dice "cannot" para cerchas y arcos aunque las piezas sean suficientes (38 % de las peticiones construibles); el re-preguntar sin piezas de Plank Studio corrige casi todas (queda un 3 %). Debe usarse junto con el re-ask y el solver.
- Cuando una medida es imposible por poco margen, una ronda de reparación puede reducir el diseño en lugar de responder "cannot" (un "1.2 m square" se convirtió en 1,10 m).
- Las estructuras curvas (cerchas en arco, medios arcos) salen con el contorno desviado unos puntos porcentuales más a menudo que con v4.
- Las peticiones en el ajuste antiguo (mesa 3900 x 2400, corte permitido) funcionan peor que con v4-27b (re-ask + solver: 93 / 82 % valid / match frente a 98 / 94 %).
- El modelo solo está pensado para estructuras de tablones en el formato del proyecto; todo plan debe verificarse antes de que el robot lo construya.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el autor advierte de que se verifique cada plan antes del ensamblaje.
- Limitaciones de idioma: solo inglés y alemán declarados.
- Restricciones de licencia: Apache 2.0, que permite uso comercial con las condiciones de la licencia; no se detallan restricciones adicionales.
- En cada petición a Ollama debe fijarse explícitamente `"think"` (`false` para uso normal, `true` solo para formas nuevas), ya que Ollama activa el pensamiento por defecto en modelos que pueden pensar.
- El modelo requiere el prompt de sistema del proyecto (`llm_prompt.system_prompt_inventory()`) rellenado con los valores de la célula (`config/plank_cell.yaml` sin su sección `prompt:`) y `allow_cuts: false` para el funcionamiento previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrLayen/plank-designer-v6-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del proyecto (paquete ROS 2 `kuka_plank_structures` y Plank Studio): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
