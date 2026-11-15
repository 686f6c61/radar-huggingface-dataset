# sautilm/SautiLM-Jua

## Resumen
SautiLM Jua es un modelo de lenguaje de generación de texto ultrafino desarrollado por LosingTek Research para el proyecto SautiLM, con sede en Bunia (Ituri, República Democrática del Congo). Se trata de un ajuste fino mediante LoRA SFT del modelo Google Gemma 3 270M-IT, empaquetado en formato `.litertlm` de 92,48 MB para ejecución 100% offline en dispositivos Android de gama baja. Forma parte de la serie fundacional SautiLM (Jua, Nuru, Wazo, Moto, Kuu, Mali) y está diseñado específicamente para contextos con conectividad limitada y coste de datos cero.

El modelo se orienta a lenguas del este de la RDC (swahili/kingwana, bbadha/kilendu) con soporte de francés e inglés, y sirve como base para diez módulos de dominio especializados (lexicografía, educación, matemáticas, salud pública, derecho congoleño, visión OCR, voz, agronomía, finanzas y administración cívica). Su relevancia actual radica en demostrar que es posible desplegar un modelo de lenguaje funcional en un contenedor de menos de 100 MB sobre hardware de 2 GB de RAM, sin conexión a internet.

La arquitectura subyacente es la de Gemma 3 270M-IT (transformer causal, 18 capas, `hidden_size=640`), ajustada con 22.834 instrucciones verificadas durante 189 pasos de entrenamiento LoRA (`r=16`, `alpha=32`), alcanzando una pérdida final de 0,4845.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma3ForCausalLM), 18 capas, hidden_size=640 |
| Parametros totales | 270M (modelo base Gemma 3 270M-IT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (empaquetado nativo en `.litertlm`) |
| Idiomas soportados | sw (swahili/kingwana), fr, en; datos adicionales en bbadha (kilendu) |
| Licencia | gemma |
| Formato de pesos | safetensors (repo) y `.litertlm` (bundle móvil de 92,48 MB) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Gemma 3 270M-IT: un transformer causal de 18 capas con dimensión oculta de 640. Sobre esta base se aplicó un ajuste fino supervisado (SFT) con LoRA de rango 16 y alpha 32 durante 189 pasos, empleando un corpus de 22.834 instrucciones verificadas que combina 1.150 entradas del diccionario bbadha (kilendu), matemáticas, educación, medicina, derecho congoleño y visión. La pérdida final registrada fue de 0,4845.

La innovación principal no reside en la arquitectura sino en el empaquetado y despliegue: el modelo se comprime a 92,48 MB en el contenedor nativo `.litertlm` y se ejecuta mediante el runtime Flutter (`flutter_edge_ai` + `flutter_edge_ai_litertlm` v1.19+) sobre Android 8.0+ (API 26+), con CPU ARM Cortex-A53/A55 o GPU móvil y un mínimo de 2 GB de RAM. No se documentan detalles sobre composición exacta del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa.

## Capacidades
- Generación de texto en swahili/kingwana, francés e inglés.
- Instrucciones de dominio educativo: biología, física, ciencias ambientales y conocimiento general.
- Aritmética, porcentajes, álgebra y cálculos comerciales (módulo Math).
- Triage de salud pública: saneamiento del agua, rehidratación oral, prevención de cólera y malaria, nutrición.
- Consultas sobre derecho congoleño (Constitución de la RDC, Código de Familia, Código Penal, Código Laboral, derecho OHADA).
- Lexicografía y traducción trilingüe bbadha–kiswahili–francés/inglés.
- Diagnóstico agronómico textual (mosaico de la yuca, roya del maíz, marchitez del café, compostaje).
- Contabilidad de cooperativas y cálculo de divisas FC/USD (módulo Fin).
- Administración cívica y mediación comunitaria.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio nativos: no disponibles en el bundle principal (los módulos Vision y Voice se anuncian como especializaciones separadas en desarrollo).

## Casos de uso
- Alfabetización y educación rural offline: el modelo puede desplegarse en smartphones Android de 2 GB de RAM para ofrecer explicaciones curriculares de biología, física y matemáticas sin conexión, eliminando el coste de datos en zonas sin cobertura.
- Triage sanitario comunitario: un agente sanitario puede consultar protocolos de rehidratación oral, prevención de cólera o saneamiento del agua directamente en el dispositivo, sin depender de conectividad en entornos rurales de la RDC.
- Preservación lingüística del bbadha (kilendu): el módulo lexicográfico, entrenado con 1.150 entradas verificadas, permite consultas de vocabulario, fonética y clases gramaticales con ejemplos trilingües, apoyando la documentación de una lengua minoritaria.
- Asistencia jurídica básica: consulta de disposiciones de la Constitución de la RDC, el Código de Familia o el derecho OHADA en dispositivos de bajo coste para mediadores y administraciones locales.
- Contabilidad de cooperativas y AVEC: cálculo de operaciones en francos congoleños y dólares, registro de ahorros village savings y apoyo a pequeñas empresas sin infraestructura de software.
- Diagnóstico agronómico de campo: identificación textual de síntomas de mosaico de la yuca, roya del maíz o marchitez del café, con recomendaciones de compostaje y conservación de suelos, en dispositivos sin red.
- Administración cívica y registro civil: orientación sobre actas de nacimiento, servicios públicos y mediación comunitaria (`Kawa`) para funcionarios locales con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: mínimo 2 GB de RAM en dispositivo; el bundle ocupa 92,48 MB, por lo que el modelo cabe holgadamente en memoria de sistemas de gama baja.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el objetivo son CPU ARM Cortex-A53/A55 o GPU móvil integrada.
- Cabe en GPU consumer: no aplica como objetivo principal; el despliegue está pensado para Android 8.0+ (API 26+) con 2 GB de RAM.
- Opciones de despliegue: runtime Flutter `flutter_edge_ai` + `flutter_edge_ai_litertlm` v1.19+; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| SautiLM Jua | 270M | no disponible | gemma | `.litertlm` offline (Android) | Ajuste LoRA de Gemma 3 270M-IT, 92,48 MB |
| Google Gemma 3 270M-IT | 270M | no disponible | gemma | safetensors, LiteRT | Modelo base; sin especialización en lenguas de la RDC |
| Modelos edge de <500M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 360M–500M | no disponible | variable | GGUF, ONNX, llama.cpp | Alternativas genéricas; no cubren swahili/kingwana ni bbadha |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks del modelo.

## Limitaciones y advertencias
- Modelo de 270M parámetros: capacidad de razonamiento y conocimiento factual muy limitada en comparación con modelos de mayor escala; propenso a errores en tareas complejas.
- Riesgo elevado de alucinación, especialmente en dominios sensibles como salud pública y derecho, donde las respuestas deben validarse con profesionales.
- Cobertura lingüística sesgada hacia swahili/kingwana, francés e inglés; el bbadha (kilendu) aparece en los datos de entrenamiento pero no se declara como idioma soportado oficialmente.
- Longitud de contexto no documentada; probablemente reducida y no adecuada para conversaciones multi-turno extensas.
- Licencia `gemma`: el uso comercial está sujeto a los términos de la Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de desplegar en producción.
- Sin datos publicados de benchmarks, evaluación de sesgos ni pruebas de robustez; madurez del proyecto temprana (0 descargas, 0 likes en el momento de la consulta).
- Dependencia del runtime Flutter específico (`flutter_edge_ai_litertlm` v1.19+), lo que limita la portabilidad a otros stacks.
- Los módulos de dominio (Lex, Med, Ius, Vision, Voice, etc.) se anuncian como especializaciones, pero varios están en desarrollo y no forman parte del bundle principal.

## Enlaces
- Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio web del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
