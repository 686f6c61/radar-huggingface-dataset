# julienkay/tiny-stable-diffusion-2-pipe-onnx

## Resumen

`julienkay/tiny-stable-diffusion-2-pipe-onnx` es un pipeline de Stable Diffusion 2 en formato ONNX con pesos aleatorios, publicado por el desarrollador julienkay. No es un modelo generativo utilizable: tal como indica su model card, las imagenes que produce son ruido. Su proposito es servir como fixture de pruebas, concretamente para los tests de regresion de la herramienta `tools.doji.diffusers` del mismo autor.

El pipeline se construye a partir de los componentes dummy del test oficial de diffusers `tests/pipelines/stable_diffusion_2/test_stable_diffusion.py` (funcion `get_dummy_components`, inicializada con `torch.manual_seed(0)`) y se exporta a ONNX mediante la libreria `optimum`. Conserva las particularidades de Stable Diffusion 2 presentes en ese test: un UNet con proyecciones lineales y un codificador de texto CLIP con activacion GELU.

Su relevancia es por tanto instrumental: permite validar flujos de exportacion, carga e inferencia ONNX de un pipeline SD2 completo sin necesidad de descargar pesos reales de varios gigabytes. El repositorio ocupa 0.0 GB y esta licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (Stable Diffusion 2): UNet con proyecciones lineales, codificador de texto CLIP con GELU, VAE y scheduler de SD2 |
| Parametros totales | no disponible (pesos dummy de test, no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el codificador CLIP tiene el limite habitual de tokens de SD2, no documentado en la ficha) |
| Tipos de cuantizacion | no disponible (exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (exportado con optimum) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado. Se trata de una exportacion a ONNX de los componentes dummy que diffusers emplea en sus tests de la pipeline Stable Diffusion 2, generados con `torch.manual_seed(0)` para garantizar reproducibilidad. La arquitectura subyacente es la de SD2: un UNet para el proceso de denoising, un codificador de texto CLIP (en esta variante con activacion GELU) para la condicion textual, un VAE para la decodificacion latente a imagen y el scheduler correspondiente.

La unica innovacion tecnica relevante es el propio proceso de exportacion con `optimum`, que convierte cada submodelo de PyTorch a grafos ONNX. El script `tools/tiny_pipelines/make_tiny_pipelines.py` del repositorio `julienkay/com.doji.diffusers` genera este artefacto. No hay datos de entrenamiento, RLHF, DPO ni ajuste alguno.

## Capacidades

- Generacion de imagenes a partir de texto a nivel de pipeline: acepta prompts y devuelve tensores de imagen, pero el contenido es ruido aleatorio.
- Exportacion ONNX funcional: permite verificar que un pipeline SD2 completo se puede cargar y ejecutar en runtime ONNX.
- Compatibilidad con la libreria diffusers (`diffusers:StableDiffusionPipeline`) y con `endpoints_compatible` segun los tags del repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.
- No tiene capacidades multilingues reales: el codificador de texto es dummy.

## Casos de uso

- Tests de regresion en CI: validar que los cambios en `tools.doji.diffusers` no rompen la carga, exportacion ni inferencia de un pipeline SD2 en ONNX, con un coste de descarga y computo minimo.
- Validacion de pipelines de exportacion ONNX: comprobar que `optimum` genera grafos correctos para UNet, CLIP, VAE y scheduler antes de aplicarlo a pesos reales.
- Pruebas de integracion de endpoints: verificar el contrato de la API de inferencia (entradas, salidas, formas de tensor) sin consumir GPU de forma significativa.
- Desarrollo de herramientas de perfilado: medir latencia y memoria del pipeline con independencia del contenido generado.
- Pruebas de compatibilidad entre versiones de diffusers y ONNX Runtime: detectar roturas de API en actualizaciones de dependencias.
- Docencia y demos de arquitectura: ilustrar la estructura interna de un pipeline SD2 (componentes, orden de ejecucion) sin necesidad de pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de pesos aleatorios, cualquier metrica de calidad de imagen carece de sentido.

## Requisitos de hardware

- VRAM estimada: no disponible; al usar componentes dummy de test, el consumo es muy inferior al de SD2 real, pero no se documenta una cifra.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime deberia bastar para ejecutar el pipeline.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido de los componentes dummy, aunque no se confirma en la ficha.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); diffusers para la definicion de la pipeline; `optimum` para la exportacion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| julienkay/tiny-stable-diffusion-2-pipe-onnx | SD2 dummy en ONNX | no disponible (dummy) | no aplica | apache-2.0 | Test de pipelines ONNX |
| stabilityai/stable-diffusion-2-1 | SD2 real | no disponible en esta ficha | no aplica | openrail++ (no confirmado aqui) | Generacion text-to-image |
| hf-internal-testing/tiny-stable-diffusion-pipe | SD dummy en PyTorch | no disponible (dummy) | no aplica | no disponible | Test de pipelines diffusers |

La comparativa con modelos de la misma categoria (dummies de test) se limita a la variante ONNX frente a la variante PyTorch de los tests oficiales de diffusers; no se dispone de datos de rendimiento para ninguna de ellas.

## Limitaciones y advertencias

- Los pesos son aleatorios: la salida es ruido y el modelo no debe usarse para generar imagenes reales.
- No es apto para produccion bajo ninguna circunstancia; su unico fin es el test automatizado.
- No se documentan sesgos porque no hay entrenamiento; cualquier analisis de sesgo es inaplicable.
- El riesgo de alucinacion no aplica en el sentido habitual, pero la salida siempre es incorrecta por construccion.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad comercial es nula.
- No se especifican los idiomas soportados ni el limite de tokens del codificador CLIP en la ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter de artefacto interno.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-stable-diffusion-2-pipe-onnx
- Repositorio del autor: https://github.com/julienkay/com.doji.diffusers
- Test de diffusers de referencia: `tests/pipelines/stable_diffusion_2/test_stable_diffusion.py` (en el repositorio de huggingface/diffusers)
- Optimum (exportacion ONNX): https://github.com/huggingface/optimum
