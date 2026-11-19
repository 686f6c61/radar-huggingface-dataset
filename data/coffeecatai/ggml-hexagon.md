# coffeecatai/ggml-hexagon

## Resumen

`coffeecatai/ggml-hexagon` no es un modelo de lenguaje, sino un repositorio de artefactos de compilación: los modulos precompilados del backend Hexagon de ggml para ejecutar transcripcion de voz en dispositivo (on-device) sobre el DSP/NPU Hexagon de Qualcomm en Android. Lo publica el usuario `coffeecatai` y esta pensado como material de entrada para construir aplicaciones de transcripcion, no como una aplicacion lista para usar.

El paquete incluye `libggml-hexagon.so`, que es el backend de ggml que se ejecuta en la CPU anfitriona, y una serie de bibliotecas `libggml-htp-v73.so` a `v81.so`, que son los skels que se cargan en el DSP para las arquitecturas Hexagon v73, v75, v79 y v81. La fuente es una version parcheada de `transcribe-cpp-sys 0.4.0` (commit `4ddacfc7926980cfd31192e4d8db1c7d0ece4bd6`).

Su relevancia es practica: permite acelerar cargas de trabajo de transcripcion en hardware movil Qualcomm sin tener que compilar el toolchain completo (NDK r29, Hexagon SDK 6.6.0.0, Android API 26). No hay pesos de modelo, no hay pipeline declarado y el repositorio ocupa 0.0 GB, lo que confirma que solo contiene binarios y metadatos de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backend ggml para DSP/NPU Hexagon (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (los binarios no declaran cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (ggml es MIT; los skels DSP se construyen con el Hexagon SDK de Qualcomm) |
| Formato de pesos | no aplica; se distribuyen bibliotecas compartidas `.so` |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento asociado. Se trata de un backend de computo para ggml que descarga parte del trabajo en el Hexagon DSP/NPU mediante los skels `libggml-htp-v73.so`, `v75.so`, `v79.so` y `v81.so`, correspondientes a las generaciones de Hexagon v73, v75, v79 y v81. El componente `libggml-hexagon.so` corre en la CPU anfitriona y actua como puente hacia el DSP.

La cadena de construccion esta documentada en la model card: NDK r29, Hexagon SDK 6.6.0.0, Android API 26 y una imagen fijada por digest. El origen es un `transcribe-cpp-sys 0.4.0` parcheado en el commit `4ddacfc7926980cfd31192e4d8db1c7d0ece4bd6`. Se incluye un fichero `SHA256SUMS` que el consumidor debe verificar antes de empaquetar. No se detallan innovaciones de decodificacion ni tecnicas de atencion porque no aplican a este tipo de artefacto.

## Capacidades

- Ejecucion de cargas de ggml en el DSP/NPU Hexagon de Qualcomm en Android.
- Soporte de transcripcion de voz on-device mediante un `transcribe-cpp-sys` parcheado.
- Cobertura de cuatro generaciones de Hexagon: v73, v75, v79 y v81.
- Verificacion de integridad mediante `SHA256SUMS`.
- No incluye tool calling, agentes, vision, audio generativo ni razonamiento: es infraestructura de inferencia, no un modelo.
- No declara capacidades multilingues propias.

## Casos de uso

- Transcripcion de voz offline en Android: integrar `libggml-hexagon.so` y el skel correspondiente al SoC para ejecutar el modelo de transcripcion en el DSP sin enviar audio a la nube.
- Aplicaciones de notas de voz con privacidad: al ejecutarse on-device, el audio no sale del dispositivo, lo que encaja con requisitos de proteccion de datos.
- Asistentes de accesibilidad: subtitulado en tiempo real de conversaciones presenciales en moviles con Hexagon v73 o superior.
- Procesamiento por lotes de grabaciones en dispositivos de campo: transcripcion de entrevistas o audios largos sin conectividad.
- Integracion en pipelines de CI/CD moviles: usar los binarios precompilados para evitar reconstruir NDK r29 y Hexagon SDK 6.6.0.0 en cada build.
- Distribucion a fabricantes de dispositivos: empaquetar los skels por generacion de Hexagon y seleccionar en tiempo de ejecucion el adecuado para cada SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC Qualcomm con Hexagon v73, v75, v79 o v81; el skel debe coincidir con la generacion del DSP.
- VRAM: no aplica; el consumo es de memoria del DSP y de la CPU anfitriona, no cuantificado en la informacion disponible.
- GPU: no aplica; el computo se delega al NPU/DSP Hexagon.
- No cabe en GPU de consumo porque no es un modelo de pesos, sino un backend para movil.
- Despliegue: integracion en aplicaciones Android mediante el backend ggml y el skel correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coffeecatai/ggml-hexagon | Backend ggml para Hexagon DSP | no aplica | no aplica | other (ggml MIT; skels con Hexagon SDK) | Hugging Face |
| Backend ggml CPU estandar | Backend ggml para CPU | no aplica | no aplica | MIT | Upstream ggml |
| Backend ggml Vulkan | Backend ggml para GPU | no aplica | no aplica | MIT | Upstream ggml |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no tiene pesos; no debe evaluarse como LLM.
- Solo cubre Hexagon v73, v75, v79 y v81; otros SoC Qualcomm no estan soportados por estos skels.
- La licencia es `other`: ggml es MIT, pero los skels DSP estan sujetos a los terminos del Hexagon SDK de Qualcomm, lo que puede condicionar la redistribucion comercial.
- El autor exige verificar `SHA256SUMS` antes de empaquetar; omitirlo introduce riesgo de integridad.
- El repositorio esta vacio en cuanto a documentacion adicional (0 descargas, 0 likes, sin pipeline ni idiomas declarados), por lo que el soporte de la comunidad es nulo.
- No se documentan sesgos ni alucinaciones porque no aplican a este artefacto; los riesgos son de compatibilidad de hardware y de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/coffeecatai/ggml-hexagon
- Fuente parcheada: `transcribe-cpp-sys 0.4.0`, commit `4ddacfc7926980cfd31192e4d8db1c7d0ece4bd6` (no se proporciona URL en la informacion disponible)
- Hexagon SDK de Qualcomm: no se proporciona URL en la informacion disponible
- Repositorio ggml: no se proporciona URL en la informacion disponible
