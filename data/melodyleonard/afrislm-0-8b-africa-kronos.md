# melodyleonard/AfriSLM-0.8B-africa-kronos

## Resumen

AfriSLM-0.8B-africa-kronos es un paquete especializado de traduccion para lenguas africanas y nigerianas, publicado por el usuario melodyleonard en Hugging Face. Forma parte de la arquitectura Kronos-2T Dual-Pack, un diseno de dos paquetes en el que este modelo cubre las lenguas africanas mientras que `melodyleonard/Hy-MT2-1.8B-2bit-kronos-v2` cubre las lenguas internacionales principales. El modelo esta construido en Rust puro a partir de `qvac/TranslatePsy-AfriSLM-0.8B`, que emplea una arquitectura hibrida Qwen3.5 con Gated DeltaNet y Gated Full Attention.

El modelo resuelve el problema de la traduccion de alta calidad en lenguas de bajos recursos, un ambito donde los modelos multilingues generalistas rinden de forma deficiente. Se ha destilado directamente del profesor sin cuantizar `qvac/TranslatePsy-AfriSLM-2B` en BF16, combinando destilacion KL a nivel de token (top-64) con un ajuste supervisado (SFT) de calibracion de contexto conversacional y de genero/registro en las capas 16 a 24 y en `final_norm`.

Su relevancia actual radica en el enfoque de despliegue en dispositivo: los pesos se distribuyen en dos niveles cuantizados Hadamard-GPTQ comprimidos con LZFSE, con tamanos de descarga de 216,76 MiB (nivel compacto `nf3g128`) y 272,83 MiB (nivel de maxima calidad `nf4g128`), lo que permite ejecutar traduccion bidireccional entre 16 idiomas en hardware de consumo. El modelo tiene 0,8B parametros declarados en el nombre y una licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5: Gated DeltaNet + Gated Full Attention |
| Parametros totales | 0,8B (segun denominacion del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hadamard-GPTQ de 4 bits (`nf4g128`) y de 3 bits (`nf3g128`), con `lm_head` NF4 atado; pesos en formato `.k2tb` comprimido con LZFSE |
| Idiomas soportados | en, yo, ig, ha, pcm, zu, xh, sw, am, tw, wo, ff, af, rw, sn, so (16 declarados en la model card; la model card menciona adicionalmente edo, efik, ibibio, tiv, ln, lg, mg, ny, om, st, tn, fr, pt y ar como lenguas cubiertas por el paquete) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.k2tb` (formato propio de Kronos) comprimido con `.lzfse`; tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La base es `qvac/TranslatePsy-AfriSLM-0.8B`, un transformer hibrido de la familia Qwen3.5 que combina capas Gated DeltaNet (atencion lineal con estado recurrente) y capas de Gated Full Attention. Sobre esta base, el autor aplica una poda multimodal y de vocabulario biyectiva que reduce el vocabulario de 248.320 a 71.296 tokens (28,7 % retenido, -71,3 % de huella en la cabeza de salida). La poda elimina subpalabras no usadas de vision (`visual.*`), de prediccion multi-token (`mtp.*`) y subpalabras CJK y de codigo no latinas, preservando cobertura Unicode sin perdida y diacriticos tonales (`ẹ́`, `ọ́`, `ṣ`, `ị`, `ụ`, `ṅ`, `ƙ`, `ɓ`, `ɗ`) y Ge'ez (`አማርኛ`).

El entrenamiento combina destilacion de conocimiento desde el profesor `qvac/TranslatePsy-AfriSLM-2B` en BF16 mediante KL a nivel de token con top-64, junto con SFT de calibracion de contexto conversacional y de genero/registro aplicado en las capas 16 a 24 y en `final_norm`. Posteriormente se aplica cuantizacion Hadamard-GPTQ en dos niveles verificados: `nf4g128` (cuerpo de 4 bits, `val_total` de 1,0936 a 0,9537) y `nf3g128` (cuerpo de 3 bits, `val_total` de 1,2644 a 1,1325). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Traduccion bidireccional (`X ↔ Y`) entre ingles y 15 lenguas africanas y nigerianas, con lenguas puente adicionales (frances, portugues, arabe) segun la model card.
- Traduccion entre pares de lenguas africanas segun la notacion bidireccional declarada.
- Soporte de diacriticos tonales y escritura Ge'ez sin perdida en el vocabulario podado.
- Calibracion de contexto conversacional y de genero/registro (segun el SFT aplicado en capas 16-24).
- Ejecucion en dispositivo (`on-device`) con dos niveles de cuantizacion seleccionables.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion en aplicaciones moviles sin conexion: los paquetes de 216,76 MiB y 272,83 MiB caben en el almacenamiento de un telefono y se descargan solo cuando el usuario selecciona una lengua africana, lo que permite traduccion bidireccional offline en entornos con conectividad limitada.
- Localizacion de documentacion y contenidos para mercados africanos: el modelo traduce ingles a swahili, hausa, zulu, igbo, yoruba y amharic con chrF++ de 54,6, 50,6, 48,0, 41,2, 30,9 y 26,6 respectivamente en FLORES-200 devtest (nivel `nf4g128`), lo que lo hace util para equipos de producto que necesitan cobertura de lenguas de bajos recursos.
- Atencion al cliente en lenguas nigerianas: con la calibracion de contexto conversacional y de registro, puede gestionar intercambios multi-turno en yoruba, igbo, hausa o pidgin nigeriano; la ventana de contexto no esta documentada, por lo que la longitud de conversacion debe validarse empiricamente.
- Traduccion de contenido sanitario o administrativo: la preservacion de diacriticos tonales y Ge'ez permite generar texto correctamente acentuado en yoruba, igbo y amharic, requisito habitual en comunicaciones oficiales.
- Subtitulado y transcripcion asistida: el rendimiento de 270-279 tok/s del nivel `nf3g128` en M4 Pro Metal permite procesar flujos de texto en tiempo casi real para subtitulos en swahili, hausa o zulu.
- Investigacion en traduccion automatica de bajos recursos: el modelo sirve como punto de comparacion cuantizado de un SLM de 0,8B destilado de un profesor de 2B, con resultados publicados en FLORES-200 devtest para seis lenguas.
- Integracion en pipelines de traduccion por paquetes: el diseno Dual-Pack permite enrutar peticiones segun la lengua detectada, usando este paquete para lenguas africanas y el paquete Hy-MT2 para lenguas internacionales.

## Benchmarks y rendimiento

Resultados en FLORES-200 `devtest` (ingles → lengua destino, n = 50), chrF++ / BLEU y velocidad en M4 Pro Metal:

| Lengua | Codigo | v1 (Hy-MT2-1.8B) chrF++ | nf4g128 chrF++ / BLEU | nf4g128 velocidad | nf3g128 chrF++ / BLEU | nf3g128 velocidad |
|---|---|---:|---:|---:|---:|---:|
| Swahili | SW | 29,4 | 54,6 / 26,6 (+25,2) | 174,5 tok/s | 53,1 / 25,3 (+23,7) | 272,0 tok/s |
| Hausa | HA | 23,5 | 50,6 / 24,4 (+27,1) | 188,9 tok/s | 47,0 / 19,9 (+23,5) | 269,6 tok/s |
| Zulu | ZU | 21,2 | 48,0 / 19,2 (+26,8) | 202,7 tok/s | 46,4 / 16,1 (+25,2) | 275,1 tok/s |
| Igbo | IG | 19,6 | 41,2 / 17,4 (+21,6) | 178,4 tok/s | 37,8 / 15,2 (+18,2) | 276,3 tok/s |
| Yoruba | YO | 15,7 | 30,9 / 12,3 (+15,2) | 207,5 tok/s | 30,2 / 12,0 (+14,5) | 279,4 tok/s |
| Amharic | AM | 3,8 | 26,6 / 5,4 (+22,8) | 171,2 tok/s | 20,4 / 3,9 (+16,6) | 276,4 tok/s |

No se han publicado resultados de benchmarks para las restantes lenguas declaradas (ig, pcm, zu, xh, tw, wo, ff, af, rw, sn, so) ni para direccion inversa (lengua africana → ingles) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los tamanos de pesos descomprimidos son 223,2 MiB (`nf3g128`) y 272,4 MiB (`nf4g128`), por lo que la huella de memoria es inferior a 1 GB en ambos casos.
- GPU recomendadas: no se especifican; las mediciones publicadas se realizaron en Apple M4 Pro con backend Metal.
- Cabe en cualquier GPU de consumo actual e incluso en dispositivos moviles, dado el tamano de los paquetes (216,76 MiB y 272,83 MiB comprimidos).
- Opciones de despliegue: el modelo usa la libreria `kronos` (no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible). Los pesos estan en formato `.k2tb` comprimido con LZFSE, no en safetensors ni GGUF.
- Latencia y throughput: 171-208 tok/s para `nf4g128` y 270-279 tok/s para `nf3g128` en M4 Pro Metal, con round-trip LZFSE byte-exacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AfriSLM-0.8B-africa-kronos | 0,8B | no disponible | Apache-2.0 | `.k2tb` + LZFSE | Especializado en lenguas africanas, cuantizado 3/4 bits, on-device |
| qvac/TranslatePsy-AfriSLM-0.8B | 0,8B | no disponible | no disponible | no disponible | Modelo base sin cuantizar del que deriva este paquete |
| qvac/TranslatePsy-AfriSLM-2B | 2B | no disponible | no disponible | BF16 | Profesor de destilacion, mayor calidad pero mayor huella |
| Hy-MT2-1.8B-2bit-kronos-v2 | 1,8B | no disponible | no disponible | `.k2tb` | Paquete complementario para lenguas internacionales; sirve como linea base v1 en los benchmarks |

No se dispone de datos de benchmarks de los modelos base ni del paquete complementario mas alla de la columna v1 de la tabla anterior, por lo que la comparativa de rendimiento se limita a esa referencia.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al entrenarse sobre datos de traduccion de bajos recursos, es probable que herede sesgos de genero y registro, parcialmente mitigados por el SFT de calibracion.
- Riesgo de alucinacion no evaluado en la informacion disponible; en traduccion, el riesgo se manifiesta como omisiones o adiciones de contenido, especialmente en pares con chrF++ bajo (amharic, yoruba).
- La longitud de contexto no esta documentada, lo que limita la planificacion de casos de uso con documentos largos.
- Los benchmarks publicados cubren solo seis lenguas y una direccion (ingles → destino); el rendimiento en las otras diez lenguas declaradas y en direccion inversa es desconocido.
- El formato de pesos `.k2tb` y la libreria `kronos` son propietarios del ecosistema del autor, lo que dificulta la integracion con herramientas estandar (vLLM, llama.cpp, TGI) y ata el despliegue a su runtime.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `ATTRIBUTIONS.md` para las citas de papers y datasets upstream.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- La fecha de creacion registrada (2026-11-13) es posterior a la fecha actual, lo que sugiere un posible error de metadatos en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/melodyleonard/AfriSLM-0.8B-africa-kronos
- Modelo base: https://huggingface.co/qvac/TranslatePsy-AfriSLM-0.8B
- Profesor de destilacion: https://huggingface.co/qvac/TranslatePsy-AfriSLM-2B
- Paquete complementario: https://huggingface.co/melodyleonard/Hy-MT2-1.8B-2bit-kronos-v2
- Modelo Qwen3.5 de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper citado: *TranslatePsy-AfriSLM: High-Quality Data Scaling For Low-Resource Machine Translation*, Gritta et al., EMNLP 2026 (referenciado en `ATTRIBUTIONS.md`; no se proporciona URL directa)
