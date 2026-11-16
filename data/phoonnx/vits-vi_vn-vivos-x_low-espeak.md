# Phoonnx/vits-vi_vn-vivos-x_low-espeak

## Resumen

vits-vi_vn-vivos-x_low-espeak es un modelo de sintesis de voz (text-to-speech) de tipo VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la coleccion piper-voices, en la ruta vi/vi_VN/vivos/x_low, y se distribuye ahora en formato compatible con phoonnx y con el ecosistema OVOS. Su funcion es convertir texto en vietnamita (vi-VN) en audio inteligible usando fonemas espeak como entrada.

La relevancia del modelo es doble: por un lado, ofrece una voz vietnamita compacta (variante x_low, la de menor calidad y tamano de la familia Piper) bajo licencia MIT, lo que facilita su integracion comercial y su despliegue en entornos con recursos limitados; por otro, su empaquetado para phoonnx y OVOS permite usarlo como plugin de sintesis en asistentes de voz y sistemas embebidos sin depender de servicios en la nube.

Se trata de un modelo pequeno orientado a inferencia ONNX, con entrada fonemica generada por espeak-ng (alfabeto IPA) y una unica voz para vietnamita. No se dispone de datos publicos sobre numero de parametros, contexto ni benchmarks en la informacion proporcionada, por lo que esta ficha se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX; variante x_low de Piper) |
| Idiomas soportados | vietnamita (vi, vi-VN) |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador generativo con discriminadores adversariales durante el entrenamiento. La variante x_low corresponde a la configuracion de menor calidad y menor coste computacional de la familia Piper, pensada para inferencia rapida en CPU.

La entrada de texto se procesa mediante fonemizacion con espeak-ng, que convierte el vietnamita en fonemas IPA antes de alimentar el modelo. Segun la model card, el modelo original fue entrenado por Rhasspy sobre el corpus VIVOS para vietnamita (ruta vi/vi_VN/vivos). No se dispone de informacion sobre numero de tokens, composicion del dataset, ni sobre el uso de RLHF o DPO; al tratarse de un modelo TTS, estos metodos no son habituales en su pipeline.

## Capacidades

- Sintesis de voz en vietnamita (vi-VN) a partir de texto.
- Entrada fonemica basada en espeak-ng (alfabeto IPA), lo que permite control fino de la pronunciacion mediante fonemas.
- Generacion de audio en formato WAV mediante la API de phoonnx (synthesize_wav).
- Integracion como plugin de TTS en OVOS (ovos-tts-plugin-phoonnx) para asistentes de voz.
- Ejecucion en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking; es exclusivamente un modelo de sintesis.
- Capacidad multilingue limitada al vietnamita.

## Casos de uso

- Asistentes de voz en vietnamita: el modelo puede integrarse en OVOS como modulo TTS para responder oralmente a consultas de usuario, gracias a su empaquetado nativo como plugin y a su bajo coste de inferencia.
- Lectura de contenido en aplicaciones moviles o web: se puede usar para convertir articulos, noticias o mensajes en audio para usuarios vietnamitas, con despliegue en cliente mediante phoonnx.js en el navegador.
- Sistemas de anuncios y avisos automatizados: adecuado para generar locuciones dinamicas en vietnamita en transporte publico, comercios o centralitas, donde la variante x_low prioriza velocidad y recursos sobre calidad maxima.
- Accesibilidad para personas con discapacidad visual: permite leer en voz alta interfaces y documentos en vietnamita sin depender de servicios cloud, manteniendo la privacidad del texto procesado.
- Prototipado rapido de productos de voz: al ser un modelo pequeno con licencia MIT y formato ONNX, sirve para validar pipelines de TTS en vietnamita antes de invertir en modelos de mayor calidad.
- Integracion en dispositivos embebidos y de bajo consumo: la variante x_low y el formato ONNX permiten ejecucion en CPU sin GPU, lo que encaja en Raspberry Pi u otros equipos con recursos limitados.
- Generacion de audiolibros o podcasts automatizados en vietnamita: util para producir borradores de narracion a bajo coste, con posterior revision o sustitucion por una voz de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo VITS x_low en ONNX, es previsible que funcione en CPU sin GPU, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponibles; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin ovos-tts-plugin-phoonnx para OVOS. Requiere espeak-ng instalado o el extra phoonnx[espeak] con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-vi_vn-vivos-x_low-espeak (este) | VITS | vi-VN | MIT | ONNX | Variante x_low, entrada espeak |
| Otras voces Piper vi_VN (vivos, distintas calidades) | VITS | vi-VN | MIT (upstream Rhasspy) | ONNX | Misma familia, calidad variable; no se detallan en la informacion |
| Modelos TTS multilingues genericos | no disponible | multi | variable | variable | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar parametros, contexto o rendimiento con alternativas concretas; los datos de la familia Piper y de otros modelos TTS no estan detallados en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de voz limitada: la variante x_low es la de menor calidad de la familia Piper, con posible menor naturalidad y mayor artefactos que variantes superiores.
- Dependencia de espeak-ng: si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la model card.
- Cobertura linguistica restringida al vietnamita; no soporta otros idiomas.
- Riesgo de errores de pronunciacion en palabras extranjeras, nombres propios o texto no normalizado correctamente por scriptconv.
- No se dispone de informacion sobre sesgos de voz, acento o genero; la unica voz incluida limita la diversidad de salida.
- Licencia MIT declarada por el upstream, lo que permite uso comercial, pero se recomienda verificar la procedencia y los terminos del corpus VIVOS y de los pesos originales de Rhasspy antes de un despliegue en produccion.
- Sin datos publicos de benchmarks, latencia ni calidad objetiva; la evaluacion debe hacerse mediante pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-vi_vn-vivos-x_low-espeak
- Upstream (Rhasspy piper-voices, vi_VN/vivos/x_low): https://huggingface.co/rhasspy/piper-voices/tree/main/vi/vi_VN/vivos/x_low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo de phoonnx.js: https://tigregotico.pt/demo
