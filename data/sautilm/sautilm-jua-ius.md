# sautilm/SautiLM-Jua-Ius

## Resumen

SautiLM-Jua-Ius es un ajuste fino del modelo Google Gemma 3 270M-IT, desarrollado por el equipo de SautiLM y LosingTek Research en Bunia (Ituri, República Democrática del Congo). Está especializado en derecho congoleño (Constitución, Código de Familia, Código Penal, Código Laboral y normativa OHADA) y empaquetado en formato `.litertlm` para ejecución completamente offline en smartphones Android mediante LiteRT-LM.

El modelo forma parte de una arquitectura modular de especialidades separadas (SautiLM-Jua, STEM, Lex, Med, Agri, Ius, Fin, Civ, Vision y Voice) que comparten una base común. Con 270 millones de parámetros y una ventana de caché de 2048 tokens, el objetivo es llevar asistencia jurídica básica a entornos con conectividad limitada o nula.

Su relevancia radica en el enfoque de despliegue: un contenedor de 272,36 MB que corre en dispositivos con Android 8.0+ y 2 GB de RAM, sin conexión a internet. El ajuste se realizó con LoRA sobre 89 instrucciones verificadas, lo que limita drásticamente el alcance real del modelo pese a la ambición del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3ForCausalLM), 18 capas, hidden_size=640 |
| Parametros totales | 270M (modelo base Gemma 3 270M-IT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (cache_length configurado) |
| Tipos de cuantizacion | dynamic_wi8_afp32 (via litert-torch); pesos TFLite FlatBuffer prefill/decode |
| Idiomas soportados | fr, en, sw (segun metadatos); el ajuste se centra en derecho de la RDC |
| Licencia | Gemma (terminos de uso de Google Gemma) |
| Formato de pesos | safetensors (repo HF) y .litertlm (bundle movil de 272,36 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 270M parámetros: un transformer decoder-only con 18 capas y dimensión oculta de 640. Sobre esta base se aplicó un ajuste supervisado (SFT) con LoRA de rango 32 y alpha 64, utilizando enmascaramiento de pérdida restringido a la respuesta (response-only loss masking) para evitar que el modelo aprenda de los tokens del prompt.

El corpus de entrenamiento consta de solo 89 instrucciones verificadas con "zero leakage", y el entrenamiento se extendió durante 162 pasos hasta alcanzar una pérdida final de 0,0013. Posteriormente, el modelo se compiló con `litert-torch` en el formato propietario `.litertlm`, generando buffers TFLite separados para prefill y decode junto con el tokenizador de Hugging Face. No se documenta el uso de RLHF, DPO ni datos adicionales más allá de esas 89 instrucciones.

## Capacidades

- Generación de texto en francés, inglés y suajili, con orientación al dominio jurídico congoleño.
- Consulta y explicación de contenidos de la Constitución de la RDC, Código de Familia, Código Penal, Código Laboral y normativa OHADA.
- Ejecución 100% offline en dispositivos Android mediante LiteRT-LM, sin llamadas a red.
- Integración con Flutter a través de los paquetes `flutter_edge_ai` y `flutter_edge_ai_litertlm`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en esta variante (la visión se reserva a SautiLM-Nuru y la voz a SautiLM-Jua-Voice).
- Capacidad multilingüe limitada a los tres idiomas declarados; no se menciona soporte de kilendu (Bbadha) en esta variante, a diferencia de SautiLM-Jua-Lex.

## Casos de uso

- Asistencia jurídica offline en zonas rurales: la aplicación puede resolver dudas sobre derechos laborales o familiares sin conexión, adecuada por su tamaño reducido y su funcionamiento en Android 8.0+ con 2 GB de RAM.
- Consulta de normativa OHADA para pequeñas empresas: el modelo puede orientar sobre obligaciones mercantiles básicas en francés, idioma principal del corpus jurídico de la RDC.
- Apoyo a mediadores comunitarios: útil para explicar en suajili o francés conceptos del Código de Familia en contextos de mediación local.
- Formación jurídica básica en escuelas y ONG: distribución como bundle `.litertlm` dentro de aplicaciones Flutter para consulta de referencia sin coste de infraestructura.
- Primer nivel de triaje administrativo: orientación sobre trámites de estado civil o laborales antes de derivar a un profesional, dado el contexto de 2048 tokens.
- Demostración e investigación en edge-AI: caso de estudio de ajuste LoRA sobre Gemma 3 270M y despliegue con LiteRT-LM en hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida final de entrenamiento (0,0013) y una verificación de runtime de 8/8 en LiteRT-LM, que no constituyen evaluaciones de calidad lingüística o jurídica.

## Requisitos de hardware

- RAM mínima: 2 GB (según especificación del autor).
- Almacenamiento: aproximadamente 272,36 MB para el bundle `.litertlm`.
- CPU: ARM Cortex-A53/A55 o GPU móvil; Android 8.0+ (API 26+).
- No requiere GPU de servidor ni aceleradores dedicados; está diseñado para ejecución en dispositivo.
- Despliegue: LiteRT-LM runtime, con integración Flutter vía `flutter_edge_ai_litertlm`.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para este bundle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| SautiLM-Jua-Ius | 270M | 2048 | Gemma | LiteRT-LM (Android) | Ajuste LoRA sobre 89 instrucciones, dominio jurídico RDC |
| google/gemma-3-270m-it | 270M | 32K (modelo base) | Gemma | Multiples (HF, LiteRT, etc.) | Modelo base instruct generalista; contexto muy superior |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | Multiples | Alternativa generalista de tamano similar con licencia permisiva |
| SmolLM2-360M-Instruct | 360M | 8K | Apache 2.0 | Multiples | Modelo pequeno orientado a edge, sin especializacion juridica |

La comparativa se basa en características públicas de los modelos citados; no se dispone de evaluaciones comparativas directas con SautiLM-Jua-Ius.

## Limitaciones y advertencias

- El ajuste se realizó sobre solo 89 instrucciones, lo que limita severamente la cobertura y fiabilidad en consultas jurídicas reales.
- Riesgo elevado de alucinación en materia legal: no debe utilizarse como sustituto de asesoramiento jurídico profesional.
- Contexto de 2048 tokens, insuficiente para documentos jurídicos extensos o conversaciones multi-turno largas.
- Idiomas limitados a francés, inglés y suajili; no se declara soporte de lenguas locales como el kilendu en esta variante.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google Gemma, que imponen restricciones y obligaciones de atribución.
- El formato `.litertlm` está atado al runtime LiteRT-LM; la portabilidad a otros motores de inferencia no está documentada.
- Sin benchmarks publicados ni validación externa de calidad; la verificación 8/8 se refiere solo al funcionamiento del runtime.
- Modelo de 270M parámetros: capacidad de razonamiento y precisión factual intrínsecamente limitadas en comparación con modelos mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sautilm/SautiLM-Jua-Ius
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Sitio web del proyecto: https://sautilm.com
- LosingTek: https://losingtek.com
