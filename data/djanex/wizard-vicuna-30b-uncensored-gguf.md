# Djanex/Wizard-Vicuna-30B-Uncensored-GGUF

## Resumen

Wizard-Vicuna-30B-Uncensored es un modelo de lenguaje de 30 000 millones de parámetros (32 528 943 616 en total) desarrollado por Eric Hartford, basado en la arquitectura Llama 2 y ajustado con el dataset sin filtrar `ehartford/wizard_vicuna_70k_unfiltered`. Este repositorio concreto, publicado por el usuario Djanex, contiene los pesos en formato GGUF, un formato optimizado para inferencia en CPU y GPU mediante llama.cpp y otras herramientas compatibles. La cuantización original fue realizada por TheBloke, aunque este repo parece ser una copia o re-subida de esos archivos.

El modelo destaca por su carácter "uncensored": no incorpora los filtros de seguridad habituales en otros modelos, lo que lo hace adecuado para tareas de generación creativa sin restricciones, aunque también implica riesgos de uso indebido. Su relevancia actual radica en que, al estar disponible en GGUF, puede ejecutarse localmente en hardware de consumo, algo atractivo para desarrolladores que buscan un modelo de 30B sin censura y con buena capacidad de razonamiento. No se dispone de información sobre la longitud de contexto ni sobre el proceso de entrenamiento más allá del dataset mencionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 2 (transformer decoder) |
| Parametros totales | 32 528 943 616 (~32,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, segun el repo original de TheBloke) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama 2, un transformer decoder con normalización RMSNorm, atención con RoPE y activación SwiGLU. No se trata de un modelo MoE ni híbrido; es un modelo denso de 30B parámetros. El entrenamiento consistió en un ajuste fino (fine-tuning) del modelo base Wizard-Vicuna sobre el dataset `ehartford/wizard_vicuna_70k_unfiltered`, que contiene 70 000 conversaciones sin filtrar. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; de hecho, el objetivo del modelo es precisamente evitar la alineación con políticas de seguridad. No hay información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Generacion de texto y chat conversacional multi-turno, siguiendo la plantilla de prompt de Vicuna.
- Razonamiento y respuesta a preguntas de diversa índole, con un nivel de calidad propio de un modelo de 30B.
- Generacion de contenido creativo, incluyendo narrativa, poesia y dialogo, sin restricciones de contenido.
- Capacidad de seguir instrucciones en ingles, aunque no se han documentado capacidades formales de tool calling, agentes o razonamiento multi-paso.
- No soporta vision, audio ni otros modos multimodales.
- Al ser "uncensored", no aplica filtros de contenido, lo que permite generar respuestas que otros modelos rechazarian.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar relatos, guiones o dialogos con tematicas adultas o controvertidas que otros modelos censurarian. Su tamaño de 30B proporciona coherencia y estilo.
- Roleplay y simulacion de personajes: gracias a su entrenamiento en conversaciones y a la ausencia de censura, es util para crear asistentes virtuales con personalidades complejas o para juegos de rol textuales.
- Generacion de contenido para ficcion especulativa: permite explorar escenarios eticos, politicos o sociales sin limitaciones impuestas por politicas de seguridad, algo valorado por escritores e investigadores.
- Asistente de lluvia de ideas: puede producir ideas no convencionales o provocadoras para proyectos creativos, sin el sesgo de moderacion de otros modelos.
- Investigacion sobre sesgos y seguridad en IA: al ser un modelo sin alineacion, sirve como caso de estudio para analizar comportamientos no filtrados y riesgos de sesgo.
- Despliegue local en entornos aislados: al estar en GGUF, puede ejecutarse en maquinas sin conexion a internet, por ejemplo en laboratorios o entornos de investigacion que requieran privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Para una cuantizacion Q4_K_M, el modelo ocupa aproximadamente 19-20 GB de almacenamiento y requiere una VRAM similar para inferencia completa en GPU. Con cuantizaciones mas agresivas (Q2_K) puede reducirse a unos 10 GB, pero con perdida de calidad.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100, o cualquier GPU con al menos 16-24 GB de VRAM para cuantizaciones de 4 bits. Para cuantizaciones de 2-3 bits, una RTX 3080 o 4070 podria ser suficiente.
- En CPU, se puede ejecutar con llama.cpp, pero se necesitan al menos 20-30 GB de RAM para cuantizaciones de 4 bits, y la velocidad sera significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp, ctransformers, llama-cpp-python, entre otros.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se dispone de mediciones concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wizard-Vicuna-30B-Uncensored (este) | 32,5B | No disponible | other | GGUF | Sin censura, basado en Llama 2 |
| Wizard-Vicuna-13B-Uncensored | 13B | No disponible | other | GGUF | Version menor del mismo modelo |
| Llama-2-13B-Chat | 13B | 4096 (tipico) | Llama 2 license | Varios | Con censura y alineacion |
| Dolphin-2.2.1-Mistral-7B | 7B | 8192 | Apache 2.0 | Varios | Sin censura, mas pequeño y moderno |

No se dispone de datos de rendimiento comparativo (benchmarks) para este modelo.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe desplegarse en aplicaciones publicas sin supervisión humana.
- La licencia "other" no esta claramente definida; se recomienda revisar los terminos del autor original (Eric Hartford) antes de uso comercial.
- Solo soporta ingles; no se ha entrenado para otros idiomas.
- No se conocen la longitud de contexto ni los detalles de entrenamiento, lo que dificulta evaluar su comportamiento en tareas de contexto largo.
- Riesgo de alucinaciones y de respuestas factualmente incorrectas, comun en modelos de esta familia.
- El repo tiene 0 descargas y 1 like, lo que sugiere que puede ser una copia reciente o poco probada; se recomienda verificar la integridad de los archivos.
- No se han publicado benchmarks, por lo que su rendimiento relativo a otros modelos es desconocido.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Djanex/Wizard-Vicuna-30B-Uncensored-GGUF
- Modelo original (Eric Hartford): https://huggingface.co/ehartford/Wizard-Vicuna-30B-Uncensored
- Repo GGUF original de TheBloke: https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GGUF
- Pagina en ModelScope: https://www.modelscope.cn/models/TheBloke/Wizard-Vicuna-30B-Uncensored-GGUF
- Entrada en Ollama: https://ollama.com/library/wizard-vicuna-uncensored
