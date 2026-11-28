# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT es un ajuste fino del modelo base Qwen/Qwen3-0.6B desarrollado por el usuario reaperdoesntknow (Convergent Intelligence LLC, Research Division). El modelo se construye en dos etapas: primero una destilacion de conocimiento desde un profesor MoE de 30B parametros (Qwen3-30B-A3B-Thinking-2507) para consolidar una base de razonamiento STEM, y despues un ajuste supervisado (SFT) sobre datos de instrucciones legales. El objetivo declarado es demostrar que la estructura del entrenamiento puede compensar la escala, comprimiendo un profesor de 30B en un estudiante de 0,6B (ratio de compresion 50x).

El modelo hereda la arquitectura Qwen3 (transformer causal con RoPE y GQA) y conserva la licencia Apache 2.0. Su principal atractivo es el despliegue en el borde: el autor afirma que ocupa menos de 500 MB cuantizado y puede ejecutarse en un telefono. La longitud de contexto de entrenamiento es de solo 1024 tokens, lo que limita su uso en tareas de contexto largo.

Es relevante ahora porque ejemplifica una tendencia practica: usar modelos profesor con trazas de razonamiento extendido (Thinking) para transferir estructura de deliberacion a estudiantes muy pequenos, y porque combina dominios aparentemente dispares (STEM y legal) bajo la tesis de que el razonamiento juridico es estructuralmente isomorfo al matematico. La ficha se basa exclusivamente en la informacion publicada en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal, RoPE, GQA) |
| Parametros totales | 751.632.384 (~0,6B) |
| Parametros activos | no aplica (modelo denso; el profesor si es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor menciona <500 MB cuantizado, sin detallar formatos) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3 con atencion de consulta agrupada (GQA) y embeddings posicionales rotatorios (RoPE). El pipeline de entrenamiento tiene dos etapas. La primera es una destilacion de conocimiento desde Qwen3-30B-A3B-Thinking-2507 (MoE, 30B totales, ~3B activos por token) sobre 6.122 muestras de chain-of-thought STEM repartidas en 12 dominios (fisica 2.254, algebra lineal 667, ecuaciones diferenciales 636, electromagnetismo 580, matematicas 576, ingenieria 574, mecanica clasica 343, mecanica teorica 307, calculo avanzado 268, fisica moderna 177, fisiologia 114 y biologia molecular 71), todas del autor 0xZee. La particion es 95/5 train/eval con semilla 42 y 5.815 muestras efectivas de entrenamiento.

La innovacion tecnica declarada esta en la funcion de perdida: una combinacion de entropia cruzada ponderada por prueba (55%, con peso 2,5x sobre los tokens de derivacion que decae a 1,5x) y divergencia KL de destilacion (45%, temperatura T=2,0 escalada por T²). El autor argumenta que el profesor Thinking produce distribuciones softmax de mayor entropia que la variante Instruct, lo que a T=2,0 expone al estudiante a un paisaje mas rico de estrategias de derivacion alternativas. Los hiperparametros de la etapa 1 son 1 epoch, batch efectivo 8, learning rate 1,5e-5 con decaimiento coseno hasta 1e-6 y precision bf16. La etapa 2 aplica SFT con TRL SFTTrainer sobre Alignment-Lab-AI/Lawyer-Instruct, con 1 epoch, batch efectivo 8, learning rate 5e-6 (mas bajo para preservar el backbone) y gradient checkpointing en bf16.

## Capacidades

- Generacion de texto y razonamiento estructurado con trazas de derivacion paso a paso (chain-of-thought), heredadas de la destilacion del profesor Thinking.
- Razonamiento matematico y cientifico en dominios STEM: calculo, algebra lineal, ecuaciones diferenciales, fisica clasica y moderna, electromagnetismo, mecanica teorica, ingenieria, fisiologia y biologia molecular.
- Analisis y razonamiento legal basico tras el SFT sobre Lawyer-Instruct (identificacion de premisas, encadenamiento logico, tratamiento de excepciones).
- Seguimiento de instrucciones en dos formatos de prompt distintos: formato de derivacion STEM y formato Instruction/Response para instrucciones legales.
- Capacidades multilingues: solo ingles segun la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en produccion: no disponible.
- Capacidades especiales (vision, audio, modo thinking nativo): no disponible.

## Casos de uso

- Tutoria de problemas STEM en el borde: el modelo puede generar derivaciones paso a paso de problemas de fisica o calculo y ejecutarse en dispositivos con recursos muy limitados (telefono, Raspberry Pi), lo que lo hace adecuado para aplicaciones educativas offline.
- Asistente de estudio de matematicas: dado su entrenamiento con formato de derivacion explicita, puede usarse para mostrar el procedimiento completo de un ejercicio de algebra lineal o ecuaciones diferenciales, no solo la respuesta final.
- Primer filtro de consultas legales: tras el SFT legal, puede clasificar y explicar diferencias conceptuales basicas (por ejemplo, delito grave frente a falta) en herramientas de triaje que derivan los casos complejos a un modelo mayor o a un profesional.
- Generacion de explicaciones cientificas breves: en documentacion tecnica o material divulgativo donde se necesita una explicacion concisa de un concepto de fisica o biologia, con la ventaja de un coste de inferencia minimo.
- Prototipado rapido y pruebas de concepto: por su tamano (menos de 500 MB cuantizado) y licencia Apache 2.0, sirve para validar pipelines de generacion antes de escalar a modelos mayores.
- Despliegue en entornos air-gapped o con privacidad estricta: al caber en hardware de consumo y no requerir GPU dedicada, puede ejecutarse localmente en escenarios donde no se permite enviar datos a la nube.
- Educacion juridica introductoria: generacion de respuestas estructuradas a preguntas tipo test sobre conceptos legales, util como borrador que un humano revisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,5 GB para los pesos (751M parametros x 2 bytes) mas overhead de activaciones y cache KV; en cuantizacion de 4 bits, por debajo de 500 MB segun el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida. En A100/H100 el modelo esta infrautilizado y la latencia vendra dominada por el overhead, no por el computo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y el autor afirma que puede ejecutarse en un telefono.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag endpoints_compatible). Para cuantizacion ligera serian necesarias herramientas adicionales (llama.cpp, Ollama) cuya compatibilidad no se detalla en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT | 0,6B | 1024 tokens | Apache 2.0 | Destilacion STEM + SFT legal |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible en esta ficha | Apache 2.0 | Modelo base generalista |
| Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales (~3B activos) | no disponible en esta ficha | no disponible en esta ficha | MoE con razonamiento extendido |

La comparativa con alternativas de la misma categoria (modelos destilados de ~0,6B especializados en razonamiento) no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la especializacion en derivaciones STEM y en instrucciones legales, a costa de un contexto de entrenamiento mucho mas corto (1024 tokens).

## Limitaciones y advertencias

- Ventana de contexto muy limitada: 1024 tokens de entrenamiento, insuficiente para documentos largos, conversaciones multi-turno extensas o analisis legal de contratos completos.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinacion elevado: con 0,6B parametros y entrenamiento en dominios muy especificos, es probable que genere derivaciones o afirmaciones legales plausibles pero incorrectas; requiere verificacion humana en cualquier uso profesional.
- Ambito legal sin validacion: el SFT legal se basa en un unico dataset (Lawyer-Instruct) y no se documentan evaluaciones de calidad juridica; no debe usarse como asesoramiento legal.
- Sesgos: no se documentan analisis de sesgos; los datasets de origen (0xZee y Alignment-Lab-AI) pueden introducir sesgos de dominio y de estilo no evaluados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar las condiciones de los datasets de entrenamiento por si imponen restricciones adicionales.
- Modelo de investigacion: el propio autor lo presenta como una tesis sobre estructura frente a escala; no hay evidencia publicada de robustez en produccion ni benchmarks que respalden las afirmaciones de rendimiento.
- Fecha de creacion en metadatos (2026-03-22) y actualizacion (2026-11-27): verificar la vigencia de los enlaces y del modelo base antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
