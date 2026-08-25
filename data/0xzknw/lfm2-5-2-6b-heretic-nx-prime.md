# 0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME

## Resumen

LFM2.5-2.6B-Heretic-NX-PRIME es una edición conductual del modelo base LiquidAI/LFM2.5-2.6B, desarrollada por el investigador 0xzknw. Su objetivo es eliminar de forma agresiva los rechazos falsos (false refusals) que el modelo base produce ante peticiones legítimas, manteniendo al mismo tiempo las capacidades generales del original. El resultado es un modelo de generación de texto con comportamiento "abliterado" (uncensored) que conserva la arquitectura híbrida LFM2 del modelo base.

El proyecto se articula en torno a tres componentes: Heretic NX, el motor de edición de modelos; Residual-Stream, el algoritmo de edición estática empleado; y PRIME, un protocolo interno de validación que verifica la preservación de capacidades mediante pruebas de no-inferioridad. La edición se regeneró desde los pesos oficiales del modelo base (revisión `654f9463ce32b05d0429d76fe1f580b27d4c1ac0`), no se derivó de otros pesos editados.

El modelo se distribuye en dos formatos: safetensors nativos en BF16 (2.697.198.592 parámetros) y un archivo GGUF también en BF16 sin cuantizar, listo para LM Studio o llama.cpp. La licencia es la lfm-open-license-v1.0 de Liquid AI, y el repositorio incluye documentación de procedencia (PROVENANCE.json) y aviso de modificación derivada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida densa, base LiquidAI/LFM2.5-2.6B) |
| Parámetros totales | 2.697.198.592 (2,6B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | BF16 nativo; GGUF BF16 sin cuantizar |
| Idiomas soportados | en, ar, zh, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (18 idiomas) |
| Licencia | lfm-open-license-v1.0 (licencia personalizada de Liquid AI) |
| Formato de pesos | safetensors (BF16) y GGUF (BF16) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un modelo denso de 2,6B parámetros con arquitectura híbrida LFM2, diseñado por Liquid AI para cargas de trabajo agénticas. Incluye una ventana de contexto de 128K tokens y soporte nativo de tool calling. El proceso de edición no implica entrenamiento adicional: Residual-Stream estima ejes contrastivos a partir de los estados ocultos residuales del modelo, elimina un subespacio benigno de baja dimensión, clasifica los sitios de intervención candidatos según la separación objetivo frente a la proyección benigna, y aplica un portafolio de reparación disperso con restauración exacta de la norma de la fila de salida.

La compilación promocionada usa ocho sitios residuales activos, un eje de reparación de rango 1 protegido por capacidades y una fuerza máxima de 1,0. La divergencia KL benigna de primer token ponderada sobre 104 filas es de 0,012396, por debajo del límite máximo de 0,0142. No se utilizó RLHF ni DPO en el proceso; la edición es completamente estática y determinista.

## Capacidades

- Generación de texto conversacional y de instrucción en 18 idiomas (incluyendo español, inglés, árabe, chino, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, tailandés y vietnamita).
- Tool calling y function calling nativos heredados del modelo base, orientados a flujos agénticos con múltiples pasos.
- Razonamiento multi-paso con planificación de tareas y ejecución de herramientas en dispositivos locales.
- Comportamiento abliterated: eliminación de rechazos falsos ante prompts legítimos, con preservación de la capacidad de rechazo ante contenido realmente dañino (según métricas XSTest).
- Ventana de contexto de 128K tokens para conversaciones largas y documentos extensos.
- Compatibilidad con Transformers (>= 5.0) y con el ecosistema llama.cpp/LM Studio mediante el archivo GGUF incluido.
- Rendimiento de decodificación de 220 tokens/s en Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395 (datos del modelo base).

## Casos de uso

- Asistentes personales en dispositivo: con un tamaño de 2,6B y menos de 2,5 GB de memoria, el modelo puede ejecutarse en portátiles, minis y móviles de gama alta sin dependencia de la nube, gestionando conversaciones multi-turno con contexto largo gracias a su ventana de 128K.
- Automatización de atención al cliente multilingüe: soporta 18 idiomas y puede desplegarse en local para gestionar consultas de usuarios sin enviar datos a servidores externos, con tool calling para integrarse en CRMs o sistemas de tickets.
- Agentes de automatización de tareas con tool calling: el modelo puede planificar y ejecutar llamadas a funciones en pipelines de CI/CD, automatización de informes o gestión de calendario, con latencia baja en hardware de consumo.
- Generación de contenido editorial sin restricciones artificiales: para equipos de redacción que necesitan producir borradores sobre temas sensibles (política, salud, sexualidad) sin que el modelo se niegue por defecto, manteniendo un filtro ante contenido realmente dañino.
- Investigación en edición de modelos: el repositorio incluye PROVENANCE.json y MODIFICATION_NOTICE.md, lo que permite a investigadores auditar el proceso de edición y reproducir los resultados sobre el modelo base.
- Desarrollo de aplicaciones de chat locales para entornos con requisitos de privacidad: hospitales, bufetes o entidades públicas pueden desplegar el modelo en infraestructura propia sin dependencia de APIs externas, con cuantización BF16 y GGUF para integración directa con llama.cpp.

## Benchmarks y rendimiento

Los datos de evaluación provienen del protocolo PRIME del autor y se presentan tal como se publicaron:

| Evaluación | Base oficial | Heretic Q8 GGUF | Heretic NX PRIME |
| --- | ---: | ---: | ---: |
| Marcadores de rechazo léxico (104 prompts) | no disponible | 5 / 104 | 6 / 104 |
| Rechazos por cada 100 | no disponible | 4,81 | 5,77 |
| KL de primer token vs. base oficial | 0,0142 (publicado) | 0,012396 |
| XSTest marcadores léxicos (450 filas) | 149 / 450 | 18 / 450 | 16 / 450 |
| XSTest prompts seguros (250 filas) | 21 / 250 | 2 / 250 | 2 / 250 |
| XSTest prompts inseguros-contraste (200 filas) | 128 / 200 | 16 / 200 | 14 / 200 |
| Capacidad emparejada (854 filas ARC-C, HellaSwag, MMLU) | 61,71% | 61,36% | 61,24% nativo / 61,48% GGUF |

El autor indica que las 104 filas dañinas se usaron como evidencia de optimización durante la búsqueda final, por lo que no se presentan como holdout intacto. Los marcadores léxicos son proxies de rechazo, no puntuaciones de seguridad semántica. La diferencia de capacidad entre PRIME y el base oficial es de -0,47 puntos porcentuales, con un intervalo ajustado de Bonferroni de [-1,76, +0,82], lo que supera el umbral de no-inferioridad de 3 puntos predeclarado. El GGUF BF16 de PRIME coincide con las predicciones del Transformers nativo en el 97,89% de las filas, con una diferencia de +0,23 puntos.

No se han publicado resultados de benchmarks convencionales (MMLU completo, HumanEval, GSM8K) para esta edición concreta en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 5,4 GB (2,6B parámetros × 2 bytes), aunque el blog de Liquid AI indica que el modelo base funciona en menos de 2,5 GB en configuraciones optimizadas (probablemente con cuantización adicional no incluida en este repositorio).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para BF16 (RTX 3060, RTX 4060, Apple Silicon M-series). Para GGUF BF16, el uso en CPU es viable gracias a llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de tarjetas modernas de gama media y alta. En móviles se puede ejecutar con cuantización adicional, aunque no se incluye en este repo.
- Opciones de despliegue: transformers (>= 5.0) con PyTorch, llama.cpp, LM Studio, vLLM (compatible con endpoints de Transformers), TGI.
- Latencia y throughput: el modelo base alcanza 220 tokens/s en Apple M5 Max y 113 tokens/s en AMD Ryzen AI Max+ 395, según datos de Liquid AI. En móvil se reportan ~30 tokens/s. Estos valores son orientativos para la edición, ya que la edición estática no introduce overhead de inferencia adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | XSTest (450) | Capacidad (854 filas) | Notas |
| --- | ---: | ---: | --- | ---: | ---: | --- |
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | 128K | lfm-open-license-v1.0 | 149 / 450 | 61,71% | Rechazos frecuentes en prompts legítimos |
| Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF | 2,6B | 128K | lfm-open-license-v1.0 | 18 / 450 | 61,36% | Q8 GGUF, editado con otro motor |
| 0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME | 2,6B | 128K | lfm-open-license-v1.0 | 16 / 450 | 61,24% nativo / 61,48% GGUF | Edición Residual-Stream con protocolo PRIME |
| Qwen3.5-9B (referencia) | 9B | no disponible | Apache-2.0 | no disponible | no disponible | Superado por el base en ToolSandbox (77,83 vs 76,44) |

La comparativa con Qwen3.5-9B proviene del blog de Liquid AI sobre el modelo base y no se ha reproducido en esta edición concreta.

## Limitaciones y advertencias

- La licencia lfm-open-license-v1.0 es una licencia personalizada de Liquid AI, no Apache-2.0. Es necesario revisar sus términos antes de un uso comercial, especialmente las cláusulas de uso de productos y servicios de la propia Liquid AI.
- El modelo es una edición conductual, no un modelo entrenado desde cero. Las capacidades de razonamiento, matemáticas o código no se han evaluado de forma exhaustiva; la prueba de capacidad se limita a 854 filas de ARC-Challenge, HellaSwag y MMLU.
- Los marcadores léxicos de rechazo (XSTest) son proxies y no puntuaciones de seguridad semántica. El modelo podría generar contenido inapropiado en contextos no cubiertos por las pruebas.
- El autor declara que las 104 filas dañinas se usaron como evidencia de optimización durante el ajuste final, por lo que no representan un holdout limpio para evaluar la seguridad del modelo.
- El protocolo PRIME es una validación interna del proyecto, no una certificación de terceros. La comparativa con el GGUF Q8 de Heretic es descriptiva y no formalmente replicable por falta de procedencia completa en el comparador.
- La eliminación de rechazos puede reducir la capacidad del modelo para negarse a contenido realmente dañino en casos límite no cubiertos por XSTest, aunque los marcadores en prompts inseguros-contraste se reducen de 16 a 14, lo que sugiere una ligera mejora en ese eje.
- El archivo GGUF incluido es BF16 sin cuantizar, por lo que no se puede ejecutar en dispositivos con menos de ~5 GB de RAM sin cuantización adicional manual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xzknw/LFM2.5-2.6B-Heretic-NX-PRIME
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Documentación del modelo base: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Blog de Liquid AI sobre LFM2.5-2.6B: https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b
- Blog de Liquid AI (despliegue de agentes): https://www.liquid.ai/blog/lfm2-5-2-6b
- Comparador Heretic GGUF: https://huggingface.co/Abiray/LFM2.5-2.6B-Heretic-Abliterated-GGUF
