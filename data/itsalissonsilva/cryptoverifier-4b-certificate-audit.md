# itsalissonsilva/CryptoVerifier-4B-Certificate-Audit

## Resumen

CryptoVerifier-4B-Certificate-Audit es un adaptador LoRA desarrollado por Alisson Matheus Silva (itsalissonsilva) sobre el modelo base Qwen/Qwen3.5-4B. Su funcion es clasificar certificados criptograficos en siete categorias diagnosticas, una tarea de razonamiento simbolico orientada a la auditoria de protocolos criptograficos. El adaptador se entrena sobre el dataset sintetico itsalissonsilva/crypto-protocol-traces-synthetic y se distribuye con licencia Apache 2.0.

El modelo resuelve un problema acotado: dado un certificado y un esquema de validacion, emitir una clasificacion diagnostica. Segun la model card, el adaptador mejora el macro recall del 18,3% (base) al 59,8% en un conjunto de evaluacion retenido de 1.792 casos, una ganancia pareada de +41,5 puntos porcentuales. Sin embargo, la tasa de falsa aceptacion empeora: 27,9% con el adaptador frente al 21,2% del modelo base.

Es relevante ahora como ejemplo de adaptacion LoRA de bajo coste (repo de 0,2 GB) para tareas de verificacion simbolica, pero sus propios autores advierten que las tasas de falsa aceptacion limitan su uso a investigacion. Para decidir si un certificado es valido debe usarse el verificador determinista incluido en el repositorio, no el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de solo atencion (attention-only) sobre transformer Qwen3.5-4B; rango original por proyeccion 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible; la evaluacion medida usa base en BF16 y pesos del adaptador en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de solo atencion con rango original 32 por proyeccion. Las actualizaciones LoRA de Q, K y V se empaquetaron en la proyeccion fusionada correspondiente de Qwen mediante matrices block-diagonal. El trabajo de conversion verifico los 208 tensores FP32 tras la carga y comprobo que cada hash de token de prompt coincidia con el fixture nativo. La revision del modelo base esta fijada en `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

El entrenamiento se realizo sobre el dataset sintetico itsalissonsilva/crypto-protocol-traces-synthetic, que incluye las filas de origen y las etiquetas deterministas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo RLHF o DPO. La evaluacion se ejecuto en una NVIDIA A10G con inferencia del modelo base en BF16 y pesos del adaptador en FP32.

## Capacidades

- Clasificacion de certificados criptograficos en siete categorias diagnosticas.
- Razonamiento simbolico sobre estructuras de certificados y grafos de protocolo.
- Generacion de texto breve con `max_tokens=64` en el ejemplo de inferencia de la model card.
- Integracion mediante la clase `CTFPolicy` con mensajes de sistema (esquema) y usuario (caso).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Auditoria de certificados en investigacion: clasificar un certificado en una de las siete categorias diagnosticas para estudiar patrones de fallo en protocolos criptograficos, usando el verificador determinista como referencia de validez.
- Analisis de grafos de protocolo profundos: el adaptador alcanza 63,6% de macro recall en el split de grafos mas profundos, adecuado para explorar estructuras complejas en entornos de laboratorio.
- Deteccion de mutaciones no vistas: con 36,2% de macro recall en mutaciones no vistas, sirve para generar hipotesis sobre tipos de mutacion que el modelo no reconoce, no para decidir validez.
- Investigacion sobre estructuras de grafo no vistas: 71,9% de macro recall en estructuras de grafo no vistas, util para estudiar generalizacion estructural.
- Generacion de etiquetas auxiliares en pipelines de datos sinteticos: usar el adaptador como clasificador preliminar y filtrar despues con el verificador determinista.
- Estudio de falsos positivos: con 40,4% de falsa aceptacion en mutaciones no vistas, el modelo es util como objeto de estudio de errores de aceptacion en verificacion simbolica.
- Prototipado rapido de auditoria: el repo de 0,2 GB y la inferencia en A10G permiten desplegar el adaptador en entornos de investigacion con recursos limitados.

## Benchmarks y rendimiento

Resultados de la evaluacion retenida de 1.792 casos (model card), comparando modelo base y adaptador:

| Split | Casos | Macro recall base | Macro recall adaptador | Falsa aceptacion base | Falsa aceptacion adaptador |
|---|---:|---:|---:|---:|---:|
| Todos los casos | 1.792 | 18,3% | 59,8% | 21,2% | 27,9% |
| Grafos mas profundos | 448 | 21,4% | 63,6% | 37,8% | 27,9% |
| Distribucion familiar | 448 | 15,4% | 67,6% | 6,0% | 23,2% |
| Mutaciones no vistas | 448 | 17,2% | 36,2% | 15,6% | 40,4% |
| Estructuras de grafo no vistas | 448 | 19,2% | 71,9% | 25,3% | 20,1% |

En la evaluacion nativa completa de Tinker (1.792 casos), el macro recall paso de 18,0% a 59,8% y la falsa aceptacion nativa de 18,8% a 28,1%. La ganancia pareada de macro recall fue de +41,5 puntos porcentuales (intervalo bootstrap agrupado al 95%: +38,7 a +44,4). La falsa aceptacion en Hugging Face fue de 27,9% (428/1.536) para el adaptador y 21,2% (325/1.536) para el base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador ocupa 0,2 GB en disco y el modelo base Qwen3.5-4B en BF16 requiere aproximadamente 8 GB de VRAM (estimacion orientativa, no publicada en la informacion disponible).
- GPU recomendadas: la evaluacion medida uso una NVIDIA A10G; no se documentan otras GPU.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base de 4B, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: PEFT con la clase `CTFPolicy` del repositorio; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CryptoVerifier-4B-Certificate-Audit | Adaptador LoRA sobre 4B | no disponible | Macro recall 59,8%; falsa aceptacion 27,9% | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Macro recall 18,3%; falsa aceptacion 21,2% | no disponible en la informacion | Hugging Face |
| itsalissonsilva/QuantumCoder-9B | 9B | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de la misma categoria (clasificacion de certificados criptograficos) en la informacion proporcionada.

## Limitaciones y advertencias

- Tasa de falsa aceptacion elevada: 27,9% en el conjunto completo y 40,4% en mutaciones no vistas; el modelo clasifica como `valid` certificados invalidos con frecuencia.
- El propio autor limita el uso a investigacion sobre clasificacion simbolica de certificados y recomienda el verificador determinista incluido para decidir validez.
- Macro recall bajo en mutaciones no vistas (36,2%), lo que indica escasa generalizacion a variantes no presentes en el dataset.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos, limitaciones de contexto ni de idioma.
- Licencia Apache 2.0 permite uso comercial, pero las tasas de falsa aceptacion desaconsejan su uso en produccion para decisiones de validez.
- Modelo con 0 descargas y 0 likes; sin validacion independiente de la comunidad.
- No se especifican idiomas soportados ni longitud de contexto del modelo base en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/CryptoVerifier-4B-Certificate-Audit
- Dataset sintetico: https://huggingface.co/datasets/itsalissonsilva/crypto-protocol-traces-synthetic/tree/f32dedb95a889ae8ff550eb61ca2e8a1bd9db5f9
- Trabajo de evaluacion en Hugging Face: https://huggingface.co/jobs/itsalissonsilva/6aee41350e0338d1bb822d14
- GitHub del autor: https://github.com/itsalissonsilva/
- Modelo relacionado del autor (QuantumCoder-9B): https://huggingface.co/itsalissonsilva/QuantumCoder-9B/tree/main/helper_verification
