# ramgathreya/nandini

## Resumen

Nandinī es un modelo de síntesis de voz (text-to-speech) especializado en canto sánscrito (pārāyaṇa), desarrollado por ramgathreya como una voz femenina para el sistema Vāgdhenu. El modelo se construyó sin grabar a una recitadora femenina real: el corpus original de Vāgdhenu se convirtió a voz femenina mediante el dataset `ramgathreya/nandini-data`, y posteriormente se hizo fine-tuning de IndicF5 sobre ese corpus con la receta de entrenamiento del propio Vāgdhenu. Los pesos resultantes funcionan sin modificaciones en el renderizador de Vāgdhenu.

Técnicamente, Nandinī hereda la arquitectura de IndicF5 / F5-TTS, un transformer de difusión con flow-matching (DiT) de dimensión 1024, profundidad 22 y 16 cabezas de atención, con aproximadamente 337 millones de parámetros, seguido de un vocoder BigVGAN-v2. El sánscrito se enruta a través del alfabeto canarés y la melodía y el ritmo provienen del clip de referencia, no de un diseño libre.

La relevancia del modelo radica en su enfoque de generación de una voz nueva sin datos de habla real de esa voz, así como en la publicación de pesos en formato PyTorch y ONNX (completo y compacto), lo que facilita su despliegue en distintos backends, incluidos CPU y Apple Silicon mediante MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching DiT (IndicF5 / F5-TTS) + vocoder BigVGAN-v2 |
| Parametros totales | ~337M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32 (ONNX completo), int8 (ONNX compacto, con AdaLN factorizado a rango 32) |
| Idiomas soportados | Sánscrito (sa), enrutado a través del alfabeto canarés |
| Licencia | Apache-2.0 (contribución propia); restricciones de uso aceptable de la licencia Bodhan AI Open Model License aplican por la voz de origen |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx) |

## Arquitectura y entrenamiento

Nandinī emplea la misma arquitectura que Vāgdhenu: un transformer de difusión con flow-matching (DiT) de dimensión 1024, profundidad 22 y 16 cabezas, con aproximadamente 337 millones de parámetros, seguido de un vocoder BigVGAN-v2. El texto sánscrito se procesa a través del alfabeto canarés, y la melodía y el ritmo se derivan del clip de referencia proporcionado en el banco de referencias, no de un control explícito de prosodia.

El entrenamiento consistió en un fine-tuning de IndicF5 (modelo base de AI4Bharat, licencia MIT) sobre el corpus Nandinī, que a su vez deriva del corpus Vāgdhenu (CC-BY-4.0) convertido a voz femenina. Se usó la receta y los ajustes de entrenamiento de Vāgdhenu, alcanzando 14.800 pasos, y se conservaron únicamente los pesos EMA. El vocoder BigVGAN-v2 de Vāgdhenu se reajustó adicionalmente sobre el corpus Nandinī. La voz femenina de origen proviene de una muestra generada con Indic-Speak (Bodhan AI / AI4Bharat, speaker Bharati, revisión `76e0814`).

## Capacidades

- Síntesis de voz para canto sánscrito clásico (recitación, pārāyaṇa).
- Detección automática del metro (meter) a partir del verso, con posibilidad de sobrescritura mediante `--meter`.
- Control de melodía y ritmo a partir de un clip de referencia (banco de referencias con un clip por metro).
- Generación determinista mediante semilla (por defecto 60, como en el sitio web de Vāgdhenu).
- Ejecución en múltiples backends: PyTorch (MPS), ONNX (CPU) y MLX (GPU de Apple Silicon).
- Versión ONNX compacta (int8) para despliegue con menores requisitos de memoria.
- No soporta svaras védicos.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Recitación y estudio de textos sánscritos: el modelo permite generar versiones cantadas de versos clásicos para práctica individual o material didáctico, con detección automática del metro y prosodia derivada de clips de referencia.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: conversión de textos sánscritos a audio cantado para escucha, usando el backend ONNX en CPU sin necesidad de GPU.
- Investigación en síntesis de voz y conversión de voz: sirve como caso de estudio de generación de una voz nueva (femenina) sin grabaciones reales de esa voz, partiendo de un corpus existente y fine-tuning de IndicF5.
- Desarrollo de aplicaciones devocionales o educativas: integración del renderizador de Vāgdhenu con los pesos de Nandinī para generar audio bajo demanda en aplicaciones de escritorio o web.
- Evaluación comparativa de vocoders y backends: el modelo permite comparar PyTorch, ONNX completo y ONNX compacto en términos de fidelidad y latencia, con métricas de error de carácter mediante Su-śrotā.
- Despliegue en Apple Silicon: mediante el backend MLX, un verso de 10 segundos se renderiza en aproximadamente 1 minuto en un MacBook Air M2, adecuado para uso local sin infraestructura dedicada.
- Prototipado de sistemas TTS multilingües con enrutamiento de script: el enfoque de enrutar sánscrito a través de canarés puede servir de base para otros pares de lengua/script en pipelines de F5-TTS.

## Benchmarks y rendimiento

| Metrica | Nandinī | Vāgdhenu (fine-tune publicado) |
|---|---|---|
| Tasa de error de carácter (Su-śrotā) | 3,81% | 3,67% |
| Diferencia (IC 95%) | 0,14 puntos (−0,38 a +0,64) | — |
| Duración relativa de los renders | ~4,5% más largos | Referencia |
| Tono (pitch) | 6,64 semitonos por encima | Referencia (6,66 del corpus) |

Evaluación realizada sobre 60 versos no vistos por ninguno de los dos modelos, cada uno renderizado una vez mediante la ruta del sitio web de Vāgdhenu. En 8 pares ciegos, un oyente juzgó la melodía igual a la de Vāgdhenu en 4 casos y mayormente igual en 1; los otros 3 diferían solo en las pausas.

En la comparación ONNX sobre cinco versos de prueba renderizados desde el mismo ruido, el conjunto ONNX completo produce la misma longitud y los mismos errores de Su-śrotā que PyTorch. El conjunto compacto difiere del completo aproximadamente lo mismo que un render con otra semilla, por lo que se ofrece como aproximación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el transformer completo en ONNX fp32 ocupa 1.358 MB y el vocoder 451 MB, más `vocos_spectrum.onnx` de 54 MB.
- Versión compacta ONNX: 344 MB (transformer int8 con AdaLN factorizado a rango 32) más el vocoder int8 y vocos.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); el modelo está pensado para ejecución local.
- Compatibilidad con GPU de consumo: sí, mediante backend MLX en Apple Silicon (probado en MacBook Air M2) y PyTorch en MPS; no se documentan requisitos para GPU NVIDIA.
- Opciones de despliegue: PyTorch (backend MPS), ONNX Runtime en CPU, MLX en Apple Silicon; el repositorio de Nandinī incluye scripts de configuración (`setup_pytorch.sh`, `setup_onnx.sh`, `setup_mlx.sh`).
- Latencia y throughput: para un verso de 10 segundos en un MacBook Air M2, aproximadamente 1 minuto con MLX, 3 minutos con PyTorch en MPS y 6 a 10 minutos con ONNX en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nandinī | ~337M | No disponible | Sánscrito (vía canarés) | Apache-2.0 (con restricciones de uso aceptable) | Pesos en Hugging Face y repo GitHub |
| Vāgdhenu | ~337M (misma arquitectura) | No disponible | Sánscrito | Apache-2.0 | Pesos y sitio web públicos |
| IndicF5 (AI4Bharat) | No disponible | No disponible | Indic (incluye sánscrito vía script) | MIT | Pesos en Hugging Face |
| F5-TTS | No disponible | No disponible | Multilingüe | Apache-2.0 | Pesos y código públicos |

Nandinī se diferencia de Vāgdhenu por la voz (femenina frente a la original) y por incluir versiones ONNX completa y compacta; el rendimiento en error de carácter es estadísticamente equivalente según el intervalo de confianza reportado.

## Limitaciones y advertencias

- No soporta svaras védicos.
- La prosodia proviene del clip de referencia, no de un diseño libre; no hay control explícito de melodía o pausas más allá de la referencia y el metro.
- Las tasas de error provienen de Su-śrotā, el mismo reconocedor que seleccionó los clips de entrenamiento, por lo que son optimistas.
- La melodía fue juzgada por un único oyente, no mediante un estudio de escucha controlado.
- Nandinī puede pausar en lugares distintos a los de Vāgdhenu.
- La voz femenina de origen proviene de Indic-Speak bajo la Bodhan AI Open Model License, cuyas restricciones de uso aceptable se aplican al modelo y a sus salidas: prohibición de clonar voces de personas reales sin consentimiento y de realizar robocalls o phishing de voz.
- No debe usarse para suplantar la identidad de ninguna persona.
- El conjunto ONNX compacto es una aproximación y no alcanzó los umbrales de fidelidad fijados de antemano.
- Solo se documenta el idioma sánscrito; no hay soporte multilingüe general.
- El modelo tiene 2 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramgathreya/nandini
- Dataset de entrenamiento: https://huggingface.co/datasets/ramgathreya/nandini-data
- Repositorio de código de Nandinī: https://github.com/ram-g-athreya/nandini
- Repositorio de Vāgdhenu: https://github.com/prathoshap/vagdhenu
- Dataset del corpus Vāgdhenu: https://huggingface.co/datasets/prathoshap/vagdhenu-data
- Modelo base IndicF5 (AI4Bharat): https://huggingface.co/ai4bharat/IndicF5
- Modelo Indic-Speak (Bodhan AI): https://huggingface.co/bodhan-ai/indic-speak
